# server.py
import os
import tempfile
import pytesseract
from flask import Flask, request, send_file
from PIL import Image
import pdfkit
from nltk import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
from nltk.probability import FreqDist
from nltk.tokenize import word_tokenize

app = Flask(__name__)

# Summarization function
def summarize_text(text, word_count=100):
    words = word_tokenize(text)
    fdist = FreqDist(words)
    stop_words = set(stopwords.words("english"))
    fdist = FreqDist({word: freq for word, freq in fdist.items() if word.lower() not in stop_words})

    sorted_words = sorted(fdist.items(), key=lambda x: x[1], reverse=True)
    important_words = set([word for word, freq in sorted_words[:int(word_count / 5)]])
    summary_sentences = [sentence for sentence in sent_tokenize(text) if len(set(word_tokenize(sentence)) & important_words) > 0]
    
    summary = " ".join(summary_sentences[:word_count])
    return summary[:word_count]

# Route to handle file uploads
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'image' not in request.files:
        return 'No file part', 400

    file = request.files['image']
    if file.filename == '':
        return 'No selected file', 400

    # Save the file
    temp_dir = tempfile.mkdtemp()
    image_path = os.path.join(temp_dir, file.filename)
    file.save(image_path)

    # Perform OCR
    text = pytesseract.image_to_string(Image.open(image_path))

    # Summarize text
    summary = summarize_text(text)

    # Generate PDF
    pdf_path = os.path.join(temp_dir, 'summary.pdf')
    pdfkit.from_string(summary, pdf_path)

    return send_file(pdf_path, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)
