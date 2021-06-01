const supertest = require('supertest');
const app = require('../../src/app.js');
const fs = require('fs');
const path = require('path');
const request = supertest(app);

const { processImage, getProcessStatus } = require('../../src/service/taskService.js');

jest.mock('../../src/service/taskService.js', () => ({
    processImage: jest.fn().mockImplementation(() => [{
        'id': 1,
        'status': 'PENDING',
        'path': '/image/1131374800_6_1_1.webp',
        'etag': '0x1'
    }]),
    getProcessStatus: jest.fn().mockImplementation(() => [{
        'id': 1,
        'status': 'PROCESSED',
        'path': '/image/1131374800_6_1_1.webp',
        'etag': '0x1'
    }]),
}));

test('Given an image When image is uploaded successfully Then should return a task response', async () => {

    const imagePath = path.join(__dirname, './resources/1131374800_6_1_1.webp');
    const image = fs.createReadStream(imagePath);

    await request.post('/task')
        .attach('image', image)
        .expect('Content-type', /json/)
        .expect(200);

});

test('Given an image id When task exists Then should return a task response', async () => {

    await request.get('/task/' + 1)
        .expect('Content-type', /json/)
        .expect(200);

});
