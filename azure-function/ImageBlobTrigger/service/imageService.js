const { Images } = require('../model/images');

async function saveImage(image) {
    return await Images.create(image);
}

module.exports = { saveImage };
