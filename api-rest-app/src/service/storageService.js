const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob');

const account = process.env.ACCOUNT_NAME || 'accountKey';
const accountKey = process.env.ACCOUNT_KEY || 'accountKey';
const containerName = process.env.STORAGE_IMAGES || 'images';

const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
const blobServiceClient = new BlobServiceClient(getBaseUrl(), sharedKeyCredential);

function getBaseUrl() {
    return `https://${account}.blob.core.windows.net`;
}

async function upload(image) {

    const { originalname, buffer, mimetype } = image;
    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists({ access: 'blob' });

    const blobOptions = {
        blobHTTPHeaders: {
            blobContentType: mimetype
        }
    };

    const blockBlobClient = containerClient.getBlockBlobClient(originalname);
    const uploadBlobResponse = await blockBlobClient.upload(buffer, Buffer.byteLength(buffer), blobOptions);
    console.log(`Upload block blob ${originalname} successfully ${uploadBlobResponse.requestId}`);

    return {
        path: `${getBaseUrl()}/${containerName}/${originalname}`,
        etag: uploadBlobResponse.etag
    };

}

module.exports = { upload };