// app.js
async function processImage() {
    const imageUpload = document.getElementById('image-upload');
    if (!imageUpload.files[0]) {
        alert('Please upload an image.');
        return;
    }

    // Display a message while processing the image
    document.getElementById('output').textContent = 'Processing the image...';

    const image = new Image();
    image.src = URL.createObjectURL(imageUpload.files[0]);
    image.onload = async () => {
        const { createWorker } = Tesseract;
        const worker = createWorker();

        // Load Tesseract.js worker
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        try {
            // Perform OCR on the image
            const { data: { text } } = await worker.recognize(image);
            console.log('Extracted text:', text);

            // Summarize the extracted text
            const summary = summarizeText(text);
            document.getElementById('output').textContent = summary;
        } catch (error) {
            console.error('OCR processing failed:', error);
            document.getElementById('output').textContent = 'Failed to process the image.';
        }
        await worker.terminate();
    };
}

function summarizeText(text) {
    // Basic summarization: First 100 words
    const summary = text.split(' ').slice(0, 100).join(' ') + '...';
    console.log('Summary:', summary);
    return summary;
}
