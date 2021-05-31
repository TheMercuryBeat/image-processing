import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';

const account = process.env.ACCOUNT_NAME;
const accountKey = process.env.ACCOUNT_KEY;
const containerName = process.env.STORAGE_IMAGES || 'images';

const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
const blobServiceClient = new BlobServiceClient(getBaseUrl(), sharedKeyCredential);

function getBaseUrl() {
    return`https://${account}.blob.core.windows.net`;
}

export default async function upload(image) {

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
