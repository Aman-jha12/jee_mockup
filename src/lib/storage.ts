import { ExamPaper, ExamSessionState } from '@/lib/types';

const EXAM_PAPER_KEY = 'exam-paper';
const EXAM_SESSION_KEY = 'exam-session';

function getStorage(storage: 'local' | 'session'): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return storage === 'local' ? window.localStorage : window.sessionStorage;
}

function readJson<T>(storage: Storage | null, key: string): T | null {
  if (!storage) return null;

  try {
    const raw = storage.getItem(key);
    if (!raw) return null;

    return JSON.parse(raw) as T;
  } catch {
    storage.removeItem(key);
    return null;
  }
}

function writeJson(storage: Storage | null, key: string, value: unknown): void {
  if (!storage) return;

  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota and serialization failures.
  }
}

export function saveExamPaper(paper: ExamPaper): void {
  writeJson(getStorage('local'), EXAM_PAPER_KEY, paper);
}

export function loadExamPaper(): ExamPaper | null {
  return readJson<ExamPaper>(getStorage('local'), EXAM_PAPER_KEY);
}

export function clearExamPaper(): void {
  const storage = getStorage('local');
  if (!storage) return;
  storage.removeItem(EXAM_PAPER_KEY);
}

export function saveExamSession(session: ExamSessionState): void {
  writeJson(getStorage('session'), EXAM_SESSION_KEY, session);
}

export function loadExamSession(): ExamSessionState | null {
  return readJson<ExamSessionState>(getStorage('session'), EXAM_SESSION_KEY);
}

export function clearExamSession(): void {
  const storage = getStorage('session');
  if (!storage) return;
  storage.removeItem(EXAM_SESSION_KEY);
}