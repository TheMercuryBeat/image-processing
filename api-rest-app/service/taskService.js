import { Tasks } from '../model/tasks.js';
import upload from '../service/storageService.js';

export async function processImage(image) {

    const { path, etag } = await upload(image);

    return await Tasks.create({
        status: 'PENDING',
        path,
        etag: espaceQuotes(etag)
    });
}

export async function getProcessStatus(taskId) {
    return await Tasks.findByPk(taskId, options);
}

function espaceQuotes(value) {
    return value.replace(/['"]+/g, '');
}