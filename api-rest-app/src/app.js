const express = require('express');
const multer = require('multer');
const { processImage, getProcessStatus } = require('./service/taskService');

const app = express();
const upload = multer();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post('/task', upload.any(), async (req, res) => {

    const process = await Promise.all(req.files.map(async file => {
        return await processImage(file);
    }));
    
    res.json(process);
})

app.get('/task/:taskId', async (req, res) => {

    const { taskId } = req.params;
    const task = await getProcessStatus(taskId);
    res.json(task);

});

module.exports = app;