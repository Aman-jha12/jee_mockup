import { Question, Subject } from "@/types/exam";
import { readFileSync } from "fs";
import { join } from "path";
import * as XLSX from "xlsx";

type SheetRow = {
  subject: string;
  type: string;
  question_text: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_answer: string;
  image_url?: string;
};

const SUBJECTS: Subject[] = ["mathematics", "physics", "chemistry"];
const REQUIRED_MCQ_PER_SUBJECT = 20;
const REQUIRED_NUMERICAL_PER_SUBJECT = 5;

const normalizeSubject = (raw: string): Subject => {
  const v = raw.trim().toLowerCase();
  if (v === "maths" || v === "mathematics") return "mathematics";
  if (v === "physics") return "physics";
  return "chemistry";
};

const randomFrom = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

const SAMPLE_MCQ_SET = [
  {
    questionText: "If f(x)=x^2-5x+6, then the value of f(2) is:",
    optionA: "0",
    optionB: "1",
    optionC: "2",
    optionD: "4",
    correctAnswer: "A",
  },
  {
    questionText: "The SI unit of electric field is:",
    optionA: "N/C",
    optionB: "J/C",
    optionC: "V/m",
    optionD: "Both A and C",
    correctAnswer: "D",
  },
  {
    questionText: "For an ideal gas process at constant temperature, PV is:",
    optionA: "Zero",
    optionB: "Constant",
    optionC: "Infinity",
    optionD: "Variable",
    correctAnswer: "B",
  },
];

const SAMPLE_NUMERICAL_SET = [
  {
    questionText: "Find the value of 12 + 18.",
    correctAnswer: "30",
  },
  {
    questionText: "If speed is 60 km/h for 2 hours, distance covered is:",
    correctAnswer: "120",
  },
  {
    questionText: "Evaluate: 2^5",
    correctAnswer: "32",
  },
];

const makeSampleQuestion = (
  subject: Subject,
  type: "mcq" | "numerical",
  sequence: number
): Question => {
  if (type === "mcq") {
    const picked = randomFrom(SAMPLE_MCQ_SET);
    return {
      id: `${subject}-mcq-sample-${sequence}`,
      subject,
      type,
      questionText: `[Sample] ${picked.questionText}`,
      optionA: picked.optionA,
      optionB: picked.optionB,
      optionC: picked.optionC,
      optionD: picked.optionD,
      correctAnswer: picked.correctAnswer,
      imageUrl: "",
    };
  }

  const picked = randomFrom(SAMPLE_NUMERICAL_SET);
  return {
    id: `${subject}-numerical-sample-${sequence}`,
    subject,
    type,
    questionText: `[Sample] ${picked.questionText}`,
    correctAnswer: picked.correctAnswer,
    imageUrl: "",
  };
};

const toHeaderKey = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

const toRowsFromUnknownSheet = (rows: Record<string, unknown>[]): SheetRow[] => {
  return rows.map((row) => {
    const normalized = Object.entries(row).reduce<Record<string, string>>((acc, [key, value]) => {
      acc[toHeaderKey(key)] = String(value ?? "").trim();
      return acc;
    }, {});

    return {
      subject: normalized.subject ?? "",
      type: normalized.type ?? "",
      question_text:
        normalized.question_text ??
        normalized.question ??
        normalized.questiontext ??
        normalized.ques ??
        "",
      option_a: normalized.option_a ?? normalized.optiona ?? normalized.a ?? "",
      option_b: normalized.option_b ?? normalized.optionb ?? normalized.b ?? "",
      option_c: normalized.option_c ?? normalized.optionc ?? normalized.c ?? "",
      option_d: normalized.option_d ?? normalized.optiond ?? normalized.d ?? "",
      correct_answer:
        normalized.correct_answer ??
        normalized.correctanswer ??
        normalized.answer ??
        normalized.correctoption ??
        normalized.correct ??
        "",
      image_url: normalized.image_url ?? normalized.imageurl ?? normalized.image ?? "",
    };
  });
};

const parseRowsToQuestions = (rows: SheetRow[]): Question[] =>
  rows
    .map<Question>((row, idx) => {
      const parsedType: Question["type"] =
        String(row.type || "").trim().toLowerCase() === "numerical" ? "numerical" : "mcq";

      return {
        id: `q-${idx + 1}`,
        subject: normalizeSubject(String(row.subject || "")),
        type: parsedType,
        questionText: String(row.question_text || "").trim(),
        optionA: String(row.option_a || "").trim(),
        optionB: String(row.option_b || "").trim(),
        optionC: String(row.option_c || "").trim(),
        optionD: String(row.option_d || "").trim(),
        correctAnswer: String(row.correct_answer || "").trim(),
        imageUrl: String(row.image_url || "").trim(),
      };
    })
    .filter((q) => q.questionText.length > 0);

const ensureRequiredQuestionSet = (questions: Question[]): Question[] => {
  const result: Question[] = [];

  for (const subject of SUBJECTS) {
    const subjectMcq = questions.filter((q) => q.subject === subject && q.type === "mcq");
    const subjectNumerical = questions.filter((q) => q.subject === subject && q.type === "numerical");

    const finalMcq = [...subjectMcq];
    const finalNumerical = [...subjectNumerical];

    while (finalMcq.length < REQUIRED_MCQ_PER_SUBJECT) {
      finalMcq.push(makeSampleQuestion(subject, "mcq", finalMcq.length + 1));
    }

    while (finalNumerical.length < REQUIRED_NUMERICAL_PER_SUBJECT) {
      finalNumerical.push(makeSampleQuestion(subject, "numerical", finalNumerical.length + 1));
    }

    result.push(...finalMcq.slice(0, REQUIRED_MCQ_PER_SUBJECT));
    result.push(...finalNumerical.slice(0, REQUIRED_NUMERICAL_PER_SUBJECT));
  }

  return result.map((q, idx) => ({ ...q, id: `q-${idx + 1}` }));
};

const fetchViaLocalExcelFile = async (): Promise<Question[] | null> => {
  try {
    const filePath = join(process.cwd(), "public", "questions", "jee_questions.xlsx");
    const fileBuffer = readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return null;

    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: "" });

    if (!rows || rows.length === 0) return null;

    return parseRowsToQuestions(toRowsFromUnknownSheet(rows));
  } catch (error) {
    console.error("Error reading local Excel file:", error);
    return null;
  }
};

const buildMockQuestions = (): Question[] => {
  const questions: Question[] = [];
  SUBJECTS.forEach((subject) => {
    for (let i = 1; i <= 20; i += 1) {
      questions.push({
        id: `${subject}-mcq-${i}`,
        subject,
        type: "mcq",
        questionText: `${subject.toUpperCase()} MCQ ${i}: This is a sample fallback question.`,
        optionA: "Option A",
        optionB: "Option B",
        optionC: "Option C",
        optionD: "Option D",
        correctAnswer: "A",
      });
    }
    for (let i = 1; i <= 5; i += 1) {
      questions.push({
        id: `${subject}-num-${i}`,
        subject,
        type: "numerical",
        questionText: `${subject.toUpperCase()} Numerical ${i}: Enter numeric answer.`,
        correctAnswer: "1",
      });
    }
  });
  return questions;
};

const fetchViaGoogleSheetApi = async (): Promise<Question[] | null> => {
  const key = process.env.GOOGLE_SHEETS_API_KEY;
  const sheetId = process.env.GOOGLE_SHEETS_QUESTIONS_SHEET_ID;
  const range = process.env.GOOGLE_SHEETS_QUESTIONS_RANGE ?? "questions!A:I";
  if (!key || !sheetId) return null;

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?key=${key}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to fetch questions from Google Sheets API.");

  const data = (await response.json()) as { values?: string[][] };
  if (!data.values || data.values.length < 2) return [];
  const [headers, ...rows] = data.values;
  const normalizedHeaders = headers.map((h) => h.trim().toLowerCase());

  const mapped = rows.map((row) => {
    const valueByHeader = normalizedHeaders.reduce<Record<string, string>>((acc, header, idx) => {
      acc[header] = row[idx] ?? "";
      return acc;
    }, {});

    return {
      subject: valueByHeader.subject,
      type: valueByHeader.type,
      question_text: valueByHeader.question_text,
      option_a: valueByHeader.option_a,
      option_b: valueByHeader.option_b,
      option_c: valueByHeader.option_c,
      option_d: valueByHeader.option_d,
      correct_answer: valueByHeader.correct_answer,
      image_url: valueByHeader.image_url,
    } satisfies SheetRow;
  });

  return parseRowsToQuestions(mapped);
};

const fetchViaCustomEndpoint = async (): Promise<Question[] | null> => {
  const endpoint = process.env.GOOGLE_SHEETS_QUESTIONS_ENDPOINT;
  if (!endpoint) return null;
  const response = await fetch(endpoint, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to fetch questions from custom endpoint.");
  const data = (await response.json()) as SheetRow[] | { rows: SheetRow[] };
  const rows = Array.isArray(data) ? data : data.rows;
  return parseRowsToQuestions(rows);
};

export const fetchQuestions = async (): Promise<Question[]> => {
  try {
    const localQuestions = await fetchViaLocalExcelFile();
    if (localQuestions && localQuestions.length > 0) return ensureRequiredQuestionSet(localQuestions);

    const apiQuestions = await fetchViaGoogleSheetApi();
    if (apiQuestions && apiQuestions.length > 0) return ensureRequiredQuestionSet(apiQuestions);

    const endpointQuestions = await fetchViaCustomEndpoint();
    if (endpointQuestions && endpointQuestions.length > 0) return ensureRequiredQuestionSet(endpointQuestions);
  } catch (error) {
    console.error(error);
  }

  return ensureRequiredQuestionSet(buildMockQuestions());
};
