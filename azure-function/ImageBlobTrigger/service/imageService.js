const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob');
const sharp = require("sharp");
const md5 = require("md5");
const sizeOf = require('image-size')
const { Images } = require('../model/images');

const account = process.env.ACCOUNT_NAME;
const accountKey = process.env.ACCOUNT_KEY;
const containerName = process.env.OUTPUT_CONTAINER_STORAGE || 'output';


const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
const blobServiceClient = new BlobServiceClient(getBaseUrl(), sharedKeyCredential);

function getBaseUrl() {
    return `https://${account}.blob.core.windows.net`;
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

async function buildImageResizedInformation(imageData) {

    const { name: filename, inputImage, contentType, size } = imageData

    const [name, extension] = filename.split('.');
    const content = await sharp(inputImage).resize({ width: size }).toBuffer();

    return { name, extension, content, contentType, size };

}

async function processAndUploadImage(imageData) {

    const { name, extension, content, contentType, size } = await buildImageResizedInformation(imageData);

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

    await blockBlobClient.upload(content, Buffer.byteLength(content), blobOptions);
    
    return {
        imageResizedName: `${imageResizedContentMd5}.${extension}`,
        imageResizedAbsolutePath: `${getBaseUrl()}/${containerName}/${imageResizedRelativePath}`,
        imageResizedContentMd5
    };
}

async function saveImage(image) {
    return await Images.create(image);
}

module.exports = { saveOriginalImage, saveResizedImage, processAndUploadImage };
