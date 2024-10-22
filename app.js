// app.js
async function processImage() {
    const imageUpload = document.getElementById('image-upload');
    const status = document.getElementById('status');
    const output = document.getElementById('output');

    // Clear previous output and status
    status.textContent = '';
    output.textContent = '';

    if (!imageUpload.files[0]) {
        status.textContent = 'Please upload an image.';
        return;
    }

    // Display a status message while processing
    status.textContent = 'Processing the image...';

    const image = new Image();
    image.src = URL.createObjectURL(imageUpload.files[0]);

    // When the image loads, perform OCR using Tesseract.js
    image.onload = async () => {
        const { createWorker } = Tesseract;
        const worker = createWorker();

        // Load Tesseract worker
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');

        try {
            // Perform OCR to extract text from the image
            const { data: { text } } = await worker.recognize(image);
            console.log('Extracted text:', text);

            // Summarize the extracted text
            const summary = summarizeText(text);
            output.textContent = `Summary:\n${summary}`;
        } catch (error) {
            console.error('OCR failed:', error);
            status.textContent = 'Failed to extract text from the image.';
        }

        // Terminate Tesseract worker
        await worker.terminate();

        // Clear status message
        status.textContent = '';
    };

    image.onerror = () => {
        status.textContent = 'Failed to load the image.';
    };
}

// Function to summarize extracted text
function summarizeText(text) {
    const words = text.split(/\s+/);
    if (words.length <= 100) {
        return text; // Return the entire text if it's already short
    }
    return words.slice(0, 100).join(' ') + '...'; // Return the first 100 words
}
