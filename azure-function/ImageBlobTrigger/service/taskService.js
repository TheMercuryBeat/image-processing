const { Tasks } = require('../model/tasks');

async function updateTaskStatus(etag, status) {
    await Tasks.update({ status }, { where: { etag } });
}

module.exports = { updateTaskStatus };
