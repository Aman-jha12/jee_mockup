import os
import re
import json
import unicodedata
import pdfplumber

# =========================================================
# CONFIG
# =========================================================

BASE_DIR = "../public"

QUESTIONBANK_DIR = os.path.join(
    BASE_DIR,
    "questionbanks"
)

OUTPUT_JSON_DIR = os.path.join(
    BASE_DIR,
    "questions",
    "json"
)

# =========================================================
# SYMBOL NORMALIZATION
# =========================================================

SYMBOL_REPLACEMENTS = {
    "sqrt": "√",
    "theta": "θ",
    "alpha": "α",
    "beta": "β",
    "gamma": "γ",
    "delta": "δ",
    "lambda": "λ",
    "mu": "μ",
    "pi": "π",
    "sigma": "σ",
    "phi": "φ",
    "omega": "ω",

    "<=": "≤",
    ">=": "≥",
    "!=": "≠",

    "integral": "∫",
    "summation": "Σ",
    "infinity": "∞"
}

# =========================================================
# BAD TEXT PATTERNS
# =========================================================

BAD_PATTERNS = [
    r'This paper contains.*?',
    r'Ground truth based on provided keys.*?',
    r'Only one option is correct.*?',
    r'Negative marking.*?',
    r'Partial marks.*?',
    r'Correct response yields.*?',
    r'Incorrect response yields.*?',
    r'Page\s+\d+',
    r'PAGE\s+\d+',
    r'Category-I.*?',
    r'Category-II.*?',
    r'Category-III.*?'
]

# =========================================================
# NORMALIZE MATH TEXT
# =========================================================

def normalize_math_text(text):

    text = unicodedata.normalize("NFKC", text)

    for old, new in SYMBOL_REPLACEMENTS.items():

        text = re.sub(
            rf'\b{re.escape(old)}\b',
            new,
            text,
            flags=re.IGNORECASE
        )

    # powers
    text = re.sub(r'(\w)\^2', r'\1²', text)
    text = re.sub(r'(\w)\^3', r'\1³', text)

    return text

# =========================================================
# CLEAN LINE
# =========================================================

def clean_line(line):

    line = unicodedata.normalize("NFKC", line)

    # remove cid garbage
    line = re.sub(r'\(cid:\d+\)', ' ', line)

    # remove page numbers
    line = re.sub(
        r'Page\s+\d+',
        '',
        line,
        flags=re.IGNORECASE
    )

    # remove bad patterns
    for pattern in BAD_PATTERNS:

        line = re.sub(
            pattern,
            '',
            line,
            flags=re.IGNORECASE
        )

    line = normalize_math_text(line)

    # clean spaces
    line = re.sub(r'\s+', ' ', line)

    return line.strip()

# =========================================================
# EXTRACT CATEGORY
# =========================================================

def extract_category(line):

    match = re.search(
        r'Category\s*[:\-]?\s*(I{1,3})',
        line,
        re.IGNORECASE
    )

    if match:
        return match.group(1).upper()

    return None

# =========================================================
# EXTRACT ANSWER
# =========================================================

def extract_answer(text):

    # Ans: A
    # Ans: (A)
    # Ans: (A,B)

    match = re.search(
        r'Ans:\s*\(?([A-D,\s]+)\)?',
        text,
        re.IGNORECASE
    )

    if not match:
        return text.strip(), None

    raw = match.group(1)

    answers = [
        x.strip().upper()
        for x in raw.split(",")
        if x.strip()
    ]

    cleaned_text = re.sub(
        r'Ans:\s*\(?[A-D,\s]+\)?',
        '',
        text,
        flags=re.IGNORECASE
    )

    if len(answers) == 1:
        return cleaned_text.strip(), answers[0]

    return cleaned_text.strip(), answers

# =========================================================
# VALID OPTION
# =========================================================

def valid_option(option):

    option = option.strip()

    if len(option) < 2:
        return False

    if option.lower().startswith("page"):
        return False

    return True

# =========================================================
# VALID QUESTION
# =========================================================

def is_valid_question(q):

    if len(q["question"].strip()) < 8:
        return False

    if "Page" in q["question"]:
        return False

    if len(q["options"]) < 4:
        return False

    if q["answer"] is None:
        return False

    return True

# =========================================================
# EXTRACT LINES
# =========================================================

def extract_lines(pdf_path):

    lines = []

    with pdfplumber.open(pdf_path) as pdf:

        for page in pdf.pages:

            text = page.extract_text(
                x_tolerance=2,
                y_tolerance=2
            )

            if not text:
                continue

            page_lines = text.split("\n")

            for line in page_lines:

                cleaned = clean_line(line)

                if cleaned:
                    lines.append(cleaned)

    return lines

# =========================================================
# PARSE QUESTIONS
# =========================================================

def parse_questions(
    lines,
    subject,
    source_pdf,
    starting_id
):

    questions = []

    current_question = None
    current_category = None

    global_id = starting_id

    for line in lines:

        # =====================================
        # CATEGORY
        # =====================================

        category = extract_category(line)

        if category:
            current_category = category
            continue

        # =====================================
        # QUESTION START
        # =====================================

        q_match = re.match(
            r'^(\d+)\.\s*(.+)',
            line
        )

        if q_match:

            if current_question and is_valid_question(current_question):
                questions.append(current_question)

            q_text = q_match.group(2)

            q_text, answer = extract_answer(q_text)

            question_type = (
                "multiple"
                if current_category == "III"
                else "single"
            )

            current_question = {
                "id": global_id,
                "subject": subject,
                "category": current_category,
                "type": question_type,
                "question": normalize_math_text(q_text),
                "options": [],
                "answer": answer,
                "image": None,
                "source_pdf": source_pdf
            }

            global_id += 1

            continue

        if not current_question:
            continue

        # =====================================
        # INLINE OPTIONS
        # =====================================

        inline_options = re.findall(
            r'\(([A-D])\)\s*([^()]+)',
            line
        )

        if inline_options:

            for label, option_text in inline_options:

                option_text, ans = extract_answer(
                    option_text
                )

                option_text = normalize_math_text(
                    option_text
                )

                if valid_option(option_text):

                    current_question["options"].append(
                        option_text.strip()
                    )

                if ans:
                    current_question["answer"] = ans

            continue

        # =====================================
        # NORMAL OPTIONS
        # =====================================

        option_match = re.match(
            r'^\(?([A-D])\)?[\).\s]+(.+)',
            line
        )

        if option_match:

            option_text = option_match.group(2)

            option_text, ans = extract_answer(
                option_text
            )

            option_text = normalize_math_text(
                option_text
            )

            if valid_option(option_text):

                current_question["options"].append(
                    option_text.strip()
                )

            if ans:
                current_question["answer"] = ans

            continue

        # =====================================
        # ANSWER LINE
        # =====================================

        if line.lower().startswith("ans:"):

            _, ans = extract_answer(line)

            if ans:
                current_question["answer"] = ans

            continue

        # =====================================
        # QUESTION CONTINUATION
        # =====================================

        text, ans = extract_answer(line)

        text = normalize_math_text(text)

        current_question["question"] += " " + text

        if ans:
            current_question["answer"] = ans

    # =====================================
    # LAST QUESTION
    # =====================================

    if current_question and is_valid_question(current_question):
        questions.append(current_question)

    return questions

# =========================================================
# SAVE QUESTIONS
# =========================================================

def save_questions(subject, questions):

    subject_dir = os.path.join(
        OUTPUT_JSON_DIR,
        subject
    )

    os.makedirs(
        subject_dir,
        exist_ok=True
    )

    output_path = os.path.join(
        subject_dir,
        f"{subject}.json"
    )

    with open(
        output_path,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            questions,
            f,
            indent=2,
            ensure_ascii=False
        )

# =========================================================
# MAIN
# =========================================================

def main():

    subject_folders = os.listdir(
        QUESTIONBANK_DIR
    )

    for subject in subject_folders:

        subject_path = os.path.join(
            QUESTIONBANK_DIR,
            subject
        )

        if not os.path.isdir(subject_path):
            continue

        print(f"\nProcessing {subject}")

        all_questions = []

        global_id = 1

        pdf_files = [
            f for f in os.listdir(subject_path)
            if f.endswith(".pdf")
        ]

        for pdf_file in pdf_files:

            pdf_path = os.path.join(
                subject_path,
                pdf_file
            )

            print(f"  Reading {pdf_file}")

            lines = extract_lines(pdf_path)

            questions = parse_questions(
                lines,
                subject,
                pdf_file,
                global_id
            )

            global_id += len(questions)

            all_questions.extend(questions)

        save_questions(
            subject,
            all_questions
        )

        print(
            f"Saved {len(all_questions)} questions for {subject}"
        )

# =========================================================

if __name__ == "__main__":
    main()