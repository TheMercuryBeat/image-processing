const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob');
const sharp = require("sharp");
const md5 = require("md5");
const { updateTaskStatus } = require('./service/taskService');

const account = process.env.ACCOUNT_NAME;
const accountKey = process.env.ACCOUNT_KEY;
const containerName = process.env.OUTPUT_CONTAINER_STORAGE || 'output';
const imageSizes = [800, 1024];

const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
const blobServiceClient = new BlobServiceClient(getBaseUrl(), sharedKeyCredential);

function getBaseUrl() {
    return `https://${account}.blob.core.windows.net`;
}

async function upload(imageInformation) {

    const { name, extension, content, contentType, size } = imageInformation;

    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists({ access: 'blob' });

    const imageResizedMd5Name = md5(content);
    const imagePath = `${name}/${size}/${imageResizedMd5Name}.${extension}`;

    const blockBlobClient = containerClient.getBlockBlobClient(imagePath);
    const blobOptions = {
        blobHTTPHeaders: {
            blobContentType: contentType
        }
    };

    const uploadBlobResponse = await blockBlobClient.upload(content, Buffer.byteLength(content), blobOptions);
    return { uploadBlobResponse, imagePath };
}

function buildImageInformation(context, content, size) {

    const contentType = context.bindingData.properties.contentType;
    const [name, extension] = context.bindingData.name.split('.');

    return { name, extension, content, contentType, size };

}

function espaceQuotes(value) {
    return value.replace(/['"]+/g, '');
}

module.exports = async function (context, inputImage) {

    try {

        context.log(`Received Blob: ${context.bindingData.name} \n`);

        const eTag = espaceQuotes(context.bindingData.properties.eTag);
        await updateTaskStatus(eTag, 'PROCESSING')

        const imagesProcessing = await Promise.all(imageSizes.map(async size => {

            const imageContentResized = await sharp(inputImage).resize({ width: size }).toBuffer();
            const imageResizedInformation = buildImageInformation(context, imageContentResized, size)
            const { uploadBlobResponse, imagePath } = await upload(imageResizedInformation);

            context.log(`Upload block blob ${imagePath} successfully`, uploadBlobResponse.requestId);
            await updateTaskStatus(eTag, 'PROCESSED');
            return `${getBaseUrl()}/${containerName}/${imagePath}`;

        }));

        context.log(`Images processed successfully: ${imagesProcessing} \n`);

    } catch (err) {
        context.log(`Images processing failure: ${err} \n`);
        await updateTaskStatus(eTag, 'ERROR');
    } finally {
        context.done();
    }

};