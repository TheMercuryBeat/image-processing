module.exports = async function (context, inputImage) {
    context.log("Received Blob:", context.bindingData.name, "\n");
    context.bindings.outputImage = context.bindings.inputImage;
    context.done();
};