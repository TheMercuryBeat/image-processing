const { Tasks } = require('../model/tasks');
const { upload } = require('./storageService');

async function processImage(image) {

    const { path, etag } = await upload(image);

    return await Tasks.create({
        status: 'PENDING',
        path,
        etag: espaceQuotes(etag)
    });
}

async function getProcessStatus(taskId) {
    return await Tasks.findByPk(taskId, options);
}

function espaceQuotes(value) {
    return value.replace(/['"]+/g, '');
}

module.exports = { processImage, getProcessStatus };