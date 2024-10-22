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

    // Log when the image starts loading
    console.log("Image is loading...");

    image.onload = async () => {
        console.log("Image loaded. Starting OCR...");

        const { createWorker } = Tesseract;
        const worker = createWorker();

        try {
            // Initialize worker and set language
            await worker.loadLanguage('eng');
            await worker.initialize('eng');
            console.log("Tesseract initialized.");

            // Perform OCR to extract text from the image
            const { data: { text } } = await worker.recognize(image);
            console.log('Extracted text:', text);

            if (text.trim() === "") {
                status.textContent = 'No text found in the image.';
                return;
            }

            // Summarize the extracted text
            const summary = summarizeText(text);
            console.log("Summary generated:", summary);
            output.textContent = `Summary:\n${summary}`;
        } catch (error) {
            console.error('OCR failed:', error);
            status.textContent = 'Failed to extract text from the image.';
        }

        // Terminate Tesseract worker
        await worker.terminate();
        console.log("Tesseract worker terminated.");

        // Clear status message
        status.textContent = '';
    };

    image.onerror = () => {
        console.error("Failed to load the image.");
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
