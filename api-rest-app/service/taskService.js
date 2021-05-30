import { Tasks } from '../model/tasks.js';

export async function processImage(file) {

    return await Tasks.create({
        status: 'PENDING',
        path: 'urlPath'
    });

}

export async function getProcessStatus (taskId) {
    return await Tasks.findByPk(taskId);
}
