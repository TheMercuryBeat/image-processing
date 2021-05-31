const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob');
const sharp = require("sharp");
const md5 = require("md5");
const sizeOf = require('image-size')

const { updateTaskStatus } = require('./service/taskService');
const { saveImage } = require('./service/imageService');

const account = process.env.ACCOUNT_NAME;
const accountKey = process.env.ACCOUNT_KEY;
const containerName = process.env.OUTPUT_CONTAINER_STORAGE || 'output';
const imageSizes = [800, 1024];

const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
const blobServiceClient = new BlobServiceClient(getBaseUrl(), sharedKeyCredential);

function getBaseUrl() {
    return `https://${account}.blob.core.windows.net`;
}

async function upload(imageResizedInformation) {

    const { name, extension, content, contentType, size } = imageResizedInformation;

    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists({ access: 'blob' });

    const imageResizedContentMd5 = md5(content);
    const imageResizedRelativePath = `${name}/${size}/${imageResizedContentMd5}.${extension}`;

    const blockBlobClient = containerClient.getBlockBlobClient(imageResizedRelativePath);
    const blobOptions = {
        blobHTTPHeaders: {
            blobContentType: contentType
        }
    };

    const uploadBlobResponse = await blockBlobClient.upload(content, Buffer.byteLength(content), blobOptions);
    return {
        requestId: uploadBlobResponse.requestId,
        imageResizedName: `${imageResizedContentMd5}.${extension}`,
        imageResizedAbsolutePath: `${getBaseUrl()}/${containerName}/${imageResizedRelativePath}`,
        imageResizedContentMd5
    };
}

async function buildImageResizedInformation(filename, contentType, originalImageContent, size) {

    const [name, extension] = filename.split('.');
    const content = await sharp(originalImageContent).resize({ width: size }).toBuffer();

    return { name, extension, content, contentType, size };

}

function espaceQuotes(value) {
    return value.replace(/['"]+/g, '');
}

async function saveOriginalImage(name, path, buffer) {

    const md5Content = md5(buffer);
    const { height: resolution } = sizeOf(buffer);
    return await saveImage({ name, path, md5Content, resolution });

}

async function saveResizedImage(originalImage, imageResized, size) {

    const { imageResizedName, imageResizedAbsolutePath, imageResizedContentMd5 } = imageResized;

    const imageResizedData = {
        name: imageResizedName,
        path: imageResizedAbsolutePath,
        md5Content: imageResizedContentMd5,
        resolution: size,
        originalId: originalImage.id
    };

    return await saveImage(imageResizedData);

}


module.exports = async function (context, inputImage) {

    const { name, uri, properties } = context.bindingData;
    const eTag = espaceQuotes(properties.eTag);
    const contentType = properties.contentType;

    try {

        context.log(`Received Blob: ${name} \n`);

        await updateTaskStatus(eTag, 'PROCESSING')
        context.log(`Updated the task status to 'PROCESSING' by eTag ${eTag}`);

        const originalImageSaved = await saveOriginalImage(name, uri, inputImage);
        context.log(`Saved original image: ${JSON.stringify(originalImageSaved)}`);

        const imagesProcessed = await Promise.all(imageSizes.map(async size => {

            const imageResizedInformation = await buildImageResizedInformation(name, contentType, inputImage, size);
            const imageResizedUploaded = await upload(imageResizedInformation);
            context.log(`Upload block blob ${imageResizedUploaded.imageResizedAbsolutePath} successfully ${imageResizedUploaded.requestId}`);

            const imageResizedSaved = await saveResizedImage(originalImageSaved, imageResizedUploaded, size);
            context.log(`Saved original image: ${JSON.stringify(imageResizedSaved)}`);

            await updateTaskStatus(eTag, 'PROCESSED');
            context.log(`Updated the task status to 'PROCESSED' by eTag ${eTag}`);

            return imageResizedSaved.path;

        }));

        context.log(`Images processed successfully: ${imagesProcessed} \n`);

    } catch (err) {
        await updateTaskStatus(eTag, 'ERROR');
        context.log(`Updated the task status to 'ERROR' by eTag ${eTag}: ${err}`);
    } finally {
        context.done();
    }

};