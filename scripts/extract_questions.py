import os
import re
import json
import pdfplumber
from pdf2image import convert_from_path
import pytesseract

BASE_DIR = "../public"
PDF_DIR = os.path.join(BASE_DIR, "questionbanks")
OUTPUT_JSON_BASE = os.path.join(BASE_DIR, "questions", "json")
OUTPUT_IMG_BASE = os.path.join(BASE_DIR, "questions", "images")


# --------------------------
# Detect subject from filename
# --------------------------
def detect_subject(filename):
    name = filename.lower()
    if "math" in name:
        return "maths"
    elif "physics" in name:
        return "physics"
    elif "chem" in name:
        return "chemistry"
    return "unknown"


# --------------------------
# Extract text
# --------------------------
def extract_text(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text


# --------------------------
# OCR fallback
# --------------------------
def ocr_pdf(pdf_path):
    pages = convert_from_path(pdf_path)
    text = ""
    for page in pages:
        text += pytesseract.image_to_string(page) + "\n"
    return text


# --------------------------
# Parse questions
# --------------------------
def parse_questions(text, subject):
    questions = []
    blocks = re.split(r"\n\d+\.", text)

    q_id = 1

    for block in blocks:
        if len(block.strip()) < 30:
            continue

        # remove Bengali / non-ascii
        block = re.sub(r"[^\x00-\x7F]+", " ", block)

        options = re.findall(r"[a-dA-D]\)\s*(.*)", block)

        question_text = block.split("a)")[0].strip()

        questions.append({
            "id": q_id,
            "subject": subject,
            "question": question_text,
            "options": options,
            "answer": None,
            "image": None
        })

        q_id += 1

    return questions


# --------------------------
# Save JSON per question
# --------------------------
def save_questions(questions, subject):
    subject_json_dir = os.path.join(OUTPUT_JSON_BASE, subject)
    os.makedirs(subject_json_dir, exist_ok=True)

    for q in questions:
        path = os.path.join(subject_json_dir, f"q_{q['id']}.json")
        with open(path, "w", encoding="utf-8") as f:
            json.dump(q, f, indent=2)


# --------------------------
# Process all PDFs
# --------------------------
def process_all_pdfs():
    for file in os.listdir(PDF_DIR):
        if not file.endswith(".pdf"):
            continue

        pdf_path = os.path.join(PDF_DIR, file)
        subject = detect_subject(file)

        print(f"Processing: {file} → {subject}")

        text = extract_text(pdf_path)

        if len(text.strip()) < 100:
            print("Using OCR fallback...")
            text = ocr_pdf(pdf_path)

        questions = parse_questions(text, subject)
        save_questions(questions, subject)

        print(f"Saved {len(questions)} questions\n")


# --------------------------
# Run
# --------------------------
if __name__ == "__main__":
    process_all_pdfs()