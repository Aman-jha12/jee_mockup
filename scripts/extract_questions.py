import os
import re
import json
import pdfplumber

# =====================================
# CONFIG
# =====================================

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

# =====================================
# CLEAN LINE
# =====================================

def clean_line(line):

    line = re.sub(r'\(cid:\d+\)', ' ', line)
    line = re.sub(r'\s+', ' ', line)

    return line.strip()

# =====================================
# CATEGORY EXTRACTION
# =====================================

def extract_category(line):

    match = re.search(
        r'Category\s*[:\-]?\s*(I{1,3})',
        line,
        re.IGNORECASE
    )

    if match:
        return match.group(1).upper()

    return None

# =====================================
# ANSWER EXTRACTION
# =====================================

def extract_answer(text):

    # Supports:
    # Ans: A
    # Ans: (A)
    # Ans: (A, B)
    # Ans: d)

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

# =====================================
# VALID QUESTION FILTER
# =====================================

def is_valid_question(q):

    if len(q["options"]) < 2:
        return False

    bad_phrases = [
        "this paper contains",
        "negative marking",
        "partial marks",
        "only one option",
        "one or more options may"
    ]

    q_text = q["question"].lower()

    for phrase in bad_phrases:
        if phrase in q_text:
            return False

    return True

# =====================================
# PDF EXTRACTION
# =====================================

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

# =====================================
# PARSER
# =====================================

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

    parsing_started = False

    for line in lines:

        # -----------------------------
        # CATEGORY
        # -----------------------------

        category = extract_category(line)

        if category:
            current_category = category
            continue

        # -----------------------------
        # QUESTION START
        # -----------------------------

        q_match = re.match(
            r'^(\d+)\.\s*(.+)',
            line
        )

        if q_match:

            parsing_started = True

            if current_question and is_valid_question(current_question):
                questions.append(current_question)

            q_text = q_match.group(2)

            q_text, answer = extract_answer(q_text)

            current_question = {
                "id": global_id,
                "subject": subject,
                "category": current_category,
                "question": q_text,
                "options": [],
                "answer": answer,
                "image": None,
                "source_pdf": source_pdf
            }

            global_id += 1

            continue

        if not parsing_started:
            continue

        if not current_question:
            continue

        # -----------------------------
        # ANSWER LINE
        # -----------------------------

        if line.lower().startswith("ans:"):

            _, ans = extract_answer(line)

            if ans:
                current_question["answer"] = ans

            continue

        # -----------------------------
        # INLINE OPTIONS
        # Example:
        # (A) option
        # -----------------------------

        inline_options = re.findall(
            r'\(([A-D])\)\s*([^()]+)',
            line
        )

        if inline_options:

            for label, option_text in inline_options:

                option_text, ans = extract_answer(
                    option_text
                )

                cleaned_option = option_text.strip()

                if cleaned_option:
                    current_question["options"].append(
                        cleaned_option
                    )

                if ans:
                    current_question["answer"] = ans

            continue

        # -----------------------------
        # NORMAL OPTIONS
        # Example:
        # A) option
        # -----------------------------

        option_match = re.match(
            r'^\(?([A-D])\)?[\).\s]+(.+)',
            line
        )

        if option_match:

            option_text = option_match.group(2)

            option_text, ans = extract_answer(
                option_text
            )

            cleaned_option = option_text.strip()

            if cleaned_option:
                current_question["options"].append(
                    cleaned_option
                )

            if ans:
                current_question["answer"] = ans

            continue

        # -----------------------------
        # QUESTION CONTINUATION
        # -----------------------------

        text, ans = extract_answer(line)

        current_question["question"] += " " + text

        if ans:
            current_question["answer"] = ans

    # ---------------------------------
    # LAST QUESTION
    # ---------------------------------

    if current_question and is_valid_question(current_question):
        questions.append(current_question)

    return questions

# =====================================
# SAVE JSON
# =====================================

def save_questions(subject, questions):

    # Creates:
    # questions/json/physics/
    # questions/json/chemistry/
    # questions/json/maths/

    subject_dir = os.path.join(
        OUTPUT_JSON_DIR,
        subject
    )

    os.makedirs(
        subject_dir,
        exist_ok=True
    )

    # Saves:
    # physics/physics.json
    # chemistry/chemistry.json

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

# =====================================
# MAIN
# =====================================

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

# =====================================

if __name__ == "__main__":
    main()