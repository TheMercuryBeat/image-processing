const express = require('express');
const multer = require('multer');
const { processImage, getProcessStatus } = require('./service/taskService.js');

const app = express();
const upload = multer();
const port = process.env.PORT || 3000;

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


app.listen(port, () => {
    console.log(`Running on PORT ${port}`);
})