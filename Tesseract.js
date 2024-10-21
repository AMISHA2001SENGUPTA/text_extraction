const { createWorker } = Tesseract;
const worker = createWorker();

await worker.load();
await worker.loadLanguage('eng');
await worker.initialize('eng');
try {
    const { data: { text } } = await worker.recognize(image);
    console.log('Extracted text:', text);
} catch (error) {
    console.error('OCR failed:', error);
    document.getElementById('output').textContent = 'Failed to extract text from the image.';
}
await worker.terminate();
