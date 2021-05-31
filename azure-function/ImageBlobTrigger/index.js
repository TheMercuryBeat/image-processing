const { updateTaskStatus } = require('./service/taskService');
const { saveOriginalImage, saveResizedImage, processAndUploadImage } = require('./service/imageService');
const imageSizes = [800, 1024];


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

            const imageData = { name, inputImage, contentType, size };
            const imageResizedUploaded = await processAndUploadImage(imageData);
            context.log(`Upload block blob ${imageResizedUploaded.imageResizedAbsolutePath} successfully`);

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

function espaceQuotes(value) {
    return value.replace(/['"]+/g, '');
}
