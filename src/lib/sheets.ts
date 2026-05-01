import { Question, Subject } from "@/types/exam";

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

const normalizeSubject = (raw: string): Subject => {
  const v = raw.trim().toLowerCase();
  if (v === "maths" || v === "mathematics") return "mathematics";
  if (v === "physics") return "physics";
  return "chemistry";
};

const parseRowsToQuestions = (rows: SheetRow[]): Question[] =>
  rows.map((row, idx) => ({
    id: `q-${idx + 1}`,
    subject: normalizeSubject(row.subject),
    type: row.type.trim().toLowerCase() === "numerical" ? "numerical" : "mcq",
    questionText: row.question_text,
    optionA: row.option_a || "",
    optionB: row.option_b || "",
    optionC: row.option_c || "",
    optionD: row.option_d || "",
    correctAnswer: row.correct_answer?.trim() ?? "",
    imageUrl: row.image_url || "",
  }));

const buildMockQuestions = (): Question[] => {
  const questions: Question[] = [];
  SUBJECTS.forEach((subject) => {
    for (let i = 1; i <= 20; i += 1) {
      questions.push({
        id: `${subject}-mcq-${i}`,
        subject,
        type: "mcq",
        questionText: `${subject.toUpperCase()} MCQ ${i}: Dummy question from fallback dataset.`,
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
    const apiQuestions = await fetchViaGoogleSheetApi();
    if (apiQuestions && apiQuestions.length > 0) return apiQuestions;

    const endpointQuestions = await fetchViaCustomEndpoint();
    if (endpointQuestions && endpointQuestions.length > 0) return endpointQuestions;
  } catch (error) {
    console.error(error);
  }

  return buildMockQuestions();
};
