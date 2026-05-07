import os
import re
import json
import fitz
from collections import defaultdict

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
ROOT_FOLDER = QUESTIONBANK_DIR
OUTPUT_FOLDER = OUTPUT_JSON_DIR

def get_subject_output_path(subject):

    subject_dir = os.path.join(OUTPUT_FOLDER, subject)
    os.makedirs(subject_dir, exist_ok=True)
    return os.path.join(subject_dir, f"{subject}.json")

# =========================================================
# TEXT CLEANING
# =========================================================

SYMBOL_REPLACEMENTS = {
    "sqrt": "\u221a",
    "theta": "\u03b8",
    "alpha": "\u03b1",
    "beta": "\u03b2",
    "gamma": "\u03b3",
    "delta": "\u03b4",
    "lambda": "\u03bb",
    "mu": "\u03bc",
    "pi": "\u03c0",
    "sigma": "\u03c3",
    "phi": "\u03c6",
    "omega": "\u03c9",
    "<=": "\u2264",
    ">=": "\u2265",
    "!=": "\u2260",
    "integral": "\u222b",
    "summation": "\u03a3",
    "infinity": "\u221e"
}

SUPERSCRIPT_MAP = str.maketrans({
    "\u00b9": "1",
    "\u00b2": "2",
    "\u00b3": "3",
    "\u2070": "0",
    "\u2074": "4",
    "\u2075": "5",
    "\u2076": "6",
    "\u2077": "7",
    "\u2078": "8",
    "\u2079": "9",
    "\u207b": "-",
    "\u207a": "+"
})

def clean_text(text):

    for k, v in SYMBOL_REPLACEMENTS.items():
        if k.isalpha():
            text = re.sub(
                rf'\b{re.escape(k)}\b',
                v,
                text,
                flags=re.IGNORECASE
            )
        else:
            text = text.replace(k, v)

    text = text.replace("\u0394", "\u03b4")
    text = text.replace("\u00d7", "x")
    text = text.replace("\u2212", "-")
    text = text.replace("\u2013", "-")
    text = text.translate(SUPERSCRIPT_MAP)
    text = re.sub(
        r'\b(cm|m)\^([23])\b',
        r'\1\2',
        text,
        flags=re.IGNORECASE
    )
    text = text.replace("\u201c", '"')
    text = text.replace("\u201d", '"')
    text = text.replace("\u2018", "'")
    text = text.replace("\u2019", "'")
    text = text.replace("”", '"')
    text = text.replace("‘", "'")
    text = text.replace("’", "'")

    # remove page numbers
    text = re.sub(
        r'Page\s*:?\s*\d+',
        '',
        text,
        flags=re.IGNORECASE
    )

    # remove cid junk
    text = re.sub(
        r'\(cid:\d+\)',
        '',
        text
    )

    # remove multiple spaces
    text = re.sub(r'\s+', ' ', text)

    return text.strip()

# =========================================================
# EXTRACT PDF LINES
# =========================================================

def extract_lines(pdf_path):

    lines = []

    doc = fitz.open(pdf_path)

    for page in doc:

        text = page.get_text("text")

        if not text:
            continue

        page_lines = text.split("\n")

        for line in page_lines:

            line = clean_text(line)

            if not line:
                continue

            # skip garbage instruction lines
            garbage_patterns = [
                "This paper contains",
                "Negative marking",
                "Partial marks",
                "Correct response",
                "Incorrect response",
                "Category-I",
                "Category-II",
                "Category-III"
            ]

            skip = False

            for g in garbage_patterns:

                if g.lower() in line.lower():
                    skip = True
                    break

            if skip:
                continue

            lines.append(line)

    doc.close()

    return lines

# =========================================================
# ANSWER KEY EXTRACTION
# =========================================================

def extract_answer_key(full_text):

    answers = {}

    match = re.search(
        r'ANSWER\s*KEY(.*)',
        full_text,
        re.IGNORECASE | re.DOTALL
    )

    if not match:
        return answers

    answer_section = match.group(1)

    matches = re.findall(
        r'(\d+)\s*[\.\)]\s*\(([A-D]+)\)',
        answer_section
    )

    for q_no, ans in matches:

        q_no = int(q_no)

        if len(ans) == 1:
            answers[q_no] = ans
        else:
            answers[q_no] = list(ans)

    return answers

# =========================================================
# QUESTION TYPE
# =========================================================

def determine_type(category):

    if category == "III":
        return "multiple"

    return "single"

# =========================================================
# REMOVE DUPLICATES
# =========================================================

def remove_duplicates(questions):

    seen = set()
    final = []

    for q in questions:

        key = (
            q["question"],
            tuple(q["options"])
        )

        if key not in seen:
            seen.add(key)
            final.append(q)

    return final

# =========================================================
# VALIDATE QUESTION
# =========================================================

def is_valid_question(question):

    if not question:
        return False

    q_text = question["question"].strip()

    if len(q_text) < 5:
        return False

    if len(question["options"]) < 3:
        return False

    return True

# =========================================================
# PARSE QUESTIONS
# =========================================================

def parse_questions(pdf_path, lines, subject, pdf_name, start_id):

    questions = []
    local_id = start_id

    raw_text = ""

    doc = fitz.open(pdf_path)

    for page in doc:

        page_text = page.get_text("text")

        if page_text:
            raw_text += "\n" + page_text

    doc.close()

    answer_key = extract_answer_key(raw_text)

    current_question = None
    current_category = "I"

    i = 0

    while i < len(lines):

        line = lines[i]

        # =================================================
        # CATEGORY DETECTION
        # =================================================

        if re.search(r'CATEGORY\s*[-:]?\s*I\b', line, re.IGNORECASE):
            current_category = "I"
            i += 1
            continue

        if re.search(r'CATEGORY\s*[-:]?\s*II\b', line, re.IGNORECASE):
            current_category = "II"
            i += 1
            continue

        if re.search(r'CATEGORY\s*[-:]?\s*III\b', line, re.IGNORECASE):
            current_category = "III"
            i += 1
            continue

        # =================================================
        # QUESTION START
        # =================================================

        q_match = re.match(
            r'^\s*(?:Q\s*)?(\d+)[\.\)]?\s+(.+)',
            line,
            re.IGNORECASE
        )

        if q_match:

            question_text = q_match.group(2).strip()

            instruction_fragments = [
                "mark each",
                "marks each",
                "only one correct option",
                "one or more options may be correct",
                "negative marking"
            ]

            if any(
                fragment in question_text.lower()
                for fragment in instruction_fragments
            ):
                i += 1
                continue

            # save previous question
            if current_question:

                if is_valid_question(current_question):
                    questions.append(current_question)

            q_no = int(q_match.group(1))

            # remove inline answer
            question_text = re.sub(
                r'Ans\s*[:\-]?\s*\(?[A-D]+\)?',
                '',
                question_text,
                flags=re.IGNORECASE
            ).strip()

            current_question = {
                "id": local_id,
                "subject": subject,
                "category": current_category,
                "type": determine_type(current_category),
                "question": question_text,
                "options": [],
                "answer": answer_key.get(q_no, None),
                "image": None,
                "source_pdf": pdf_name
            }

            # inline answer support
            inline_answer = re.search(
                r'Ans\s*[:\-]?\s*\(?([A-D]+)\)?',
                line,
                re.IGNORECASE
            )

            if inline_answer:

                ans = inline_answer.group(1)

                if len(ans) == 1:
                    current_question["answer"] = ans
                else:
                    current_question["answer"] = list(ans)

            local_id += 1

            i += 1
            continue

        # =================================================
        # ANSWER LINE
        # =================================================

        answer_match = re.match(
            r'^\s*(?:Ans|Answer)\s*[:\-]?\s*\(?([A-D](?:\s*,\s*[A-D])*)\)?\s*$',
            line,
            re.IGNORECASE
        )

        if answer_match and current_question:

            answer_value = [
                part.strip()
                for part in answer_match.group(1).split(',')
                if part.strip()
            ]

            if len(answer_value) == 1:
                current_question["answer"] = answer_value[0]
            else:
                current_question["answer"] = answer_value

            i += 1
            continue

        # =================================================
        # INLINE OPTIONS
        # =================================================

        inline_options = re.findall(
            r'\(([A-D])\)\s*([^()]+?)(?=\s*\([A-D]\)|$)',
            line
        )

        if inline_options and current_question:

            for _, option_text in inline_options:

                option_text = option_text.strip()

                option_text = re.sub(
                    r'Ans\s*[:\-]?\s*\(?[A-D]+\)?',
                    '',
                    option_text,
                    flags=re.IGNORECASE
                ).strip()

                if (
                    option_text
                    and option_text not in current_question["options"]
                ):
                    current_question["options"].append(option_text)

            i += 1
            continue

        # =================================================
        # NORMAL OPTIONS
        # =================================================

        option_match = re.match(
            r'^\(?([A-D])\)?[\.\)]?\s+(.+)',
            line
        )

        if option_match and current_question:

            option_text = option_match.group(2).strip()

            if option_text.lower().startswith(
                "can be represented by"
            ):

                current_question["question"] += (
                    " " + option_text
                )

                i += 1
                continue

            option_text = re.sub(
                r'Ans\s*[:\-]?\s*\(?[A-D]+\)?',
                '',
                option_text,
                flags=re.IGNORECASE
            ).strip()

            if (
                option_text
                and option_text not in current_question["options"]
            ):
                current_question["options"].append(option_text)

            i += 1
            continue

        # =================================================
        # CONTINUED QUESTION TEXT
        # =================================================

        if current_question:

            if len(current_question["options"]) == 0:

                # avoid answer key contamination
                if not re.search(
                    r'^\d+\.\s*\([A-D]+\)',
                    line
                ):

                    current_question["question"] += (
                        " " + line
                    )

        i += 1

    # =====================================================
    # FINAL QUESTION
    # =====================================================

    if current_question:

        if is_valid_question(current_question):
            questions.append(current_question)

    for idx, question in enumerate(questions, start=start_id):
        question["id"] = idx

    return questions

# =========================================================
# PROCESS PDFs
# =========================================================

subject_questions = defaultdict(list)
subject_next_id = defaultdict(lambda: 1)
processed_source_pdfs = defaultdict(set)

for subject in ["chemistry", "maths", "physics"]:

    output_path = get_subject_output_path(subject)
    legacy_output_path = os.path.join(
        OUTPUT_FOLDER,
        f"{subject}.json"
    )

    if (not os.path.exists(output_path)) and os.path.exists(legacy_output_path):
        try:
            with open(legacy_output_path, "r", encoding="utf-8") as src:
                legacy_questions = json.load(src)
            with open(output_path, "w", encoding="utf-8") as dst:
                json.dump(legacy_questions, dst, indent=2, ensure_ascii=False)
            print(
                f"Migrated legacy file for {subject}: {legacy_output_path} -> {output_path}"
            )
        except Exception as e:
            print(f"Could not migrate legacy {subject}.json: {e}")

    if not os.path.exists(output_path):
        continue

    try:

        with open(output_path, "r", encoding="utf-8") as f:
            existing_questions = json.load(f)

        for question in existing_questions:
            if isinstance(question.get("question"), str):
                question["question"] = clean_text(question["question"])
            if isinstance(question.get("options"), list):
                question["options"] = [
                    clean_text(option) if isinstance(option, str) else option
                    for option in question["options"]
                ]

        subject_questions[subject].extend(existing_questions)

        existing_ids = [
            q.get("id")
            for q in existing_questions
            if isinstance(q.get("id"), int)
        ]

        if existing_ids:
            subject_next_id[subject] = max(existing_ids) + 1

        processed_source_pdfs[subject] = {
            q.get("source_pdf")
            for q in existing_questions
            if q.get("source_pdf")
        }

        print(
            f"Loaded {len(existing_questions)} existing questions for {subject}"
        )

    except Exception as e:
        print(f"Could not load existing {subject}.json: {e}")

for root, dirs, files in os.walk(ROOT_FOLDER):

    for file in files:

        if not file.lower().endswith(".pdf"):
            continue

        pdf_path = os.path.join(root, file)

        lower = file.lower()

        if "physics" in lower:
            subject = "physics"

        elif "chem" in lower:
            subject = "chemistry"

        elif "math" in lower:
            subject = "maths"

        else:
            print(f"Skipping unknown subject: {file}")
            continue

        if file in processed_source_pdfs[subject]:
            print(f"Skipping already processed PDF: {file}")
            continue

        print(f"\nProcessing: {file}")

        try:
            lines = extract_lines(pdf_path)

            questions = parse_questions(
                pdf_path,
                lines,
                subject,
                file,
                subject_next_id[subject]
            )

            subject_next_id[subject] += len(questions)

            subject_questions[subject].extend(
                questions
            )

            processed_source_pdfs[subject].add(file)

            print(
                f"Extracted {len(questions)} questions"
            )

        except Exception as e:

            print(f"Error in {file}")
            print(str(e))

# =========================================================
# SAVE JSON
# =========================================================

for subject, questions in subject_questions.items():

    output_path = os.path.join(
        OUTPUT_FOLDER,
        subject,
        f"{subject}.json"
    )

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

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

    print(
        f"\nSaved {len(questions)} questions -> {output_path}"
    )

print("\nDONE")