from flask import Flask, request, render_template, jsonify
from werkzeug.utils import secure_filename
import os
import PyPDF2
from docx import Document
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)

# Configuration for file uploads
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'pdf', 'docx', 'txt'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def extract_text_from_pdf(pdf_path):
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfFileReader(file)
        text = ""
        for page in range(reader.numPages):
            text += reader.getPage(page).extractText()
    return text

def extract_text_from_docx(docx_path):
    doc = Document(docx_path)
    text = ""
    for para in doc.paragraphs:
        text += para.text
    return text

def extract_text_from_txt(txt_path):
    with open(txt_path, 'r') as file:
        text = file.read()
    return text

def match_job(resume_text, job_descriptions):
    # TF-IDF Vectorization
    tfidf_vectorizer = TfidfVectorizer(stop_words='english')
    all_text = [resume_text] + job_descriptions
    tfidf_matrix = tfidf_vectorizer.fit_transform(all_text)

    # Calculate Cosine Similarity between the resume and all job descriptions
    cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])
    return cosine_sim[0]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'resume' not in request.files:
        return 'No file part'
    file = request.files['resume']
    if file.filename == '':
        return 'No selected file'
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Extract text from the uploaded resume
        if filename.endswith('.pdf'):
            resume_text = extract_text_from_pdf(filepath)
        elif filename.endswith('.docx'):
            resume_text = extract_text_from_docx(filepath)
        elif filename.endswith('.txt'):
            resume_text = extract_text_from_txt(filepath)

        # Sample job descriptions (In a real app, this could come from a database or API)
        job_descriptions = [
            "Data Scientist with experience in Python, Machine Learning, and Data Analysis.",
            "Software Engineer proficient in Java and Python, with experience in full-stack development.",
            "AI Researcher with a focus on deep learning and computer vision.",
        ]

        # Match the resume to the job descriptions
        similarity_scores = match_job(resume_text, job_descriptions)

        # Find the best match
        best_match_idx = similarity_scores.argmax()
        best_match = job_descriptions[best_match_idx]
        best_score = similarity_scores[best_match_idx]

        return render_template('result.html', best_match=best_match, best_score=best_score)

    return 'Invalid file format'

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=3000)
