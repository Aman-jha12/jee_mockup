export type InstructionPart = { content: string; bold?: boolean };

export type Instruction = {
  id: string | number;
  text: InstructionPart[];
};

export const instructions: Instruction[] = [
  {
    id: 1,
    text: [{ content: 'Please note this is a mock based test', bold: true }],
  },
  {
    id: 2,
    text: [
      { content: 'Total Papers: 2 | Total Duration: 4 hours\n\n', bold: true },
      { content: 'Paper 1: Mathematics (2 hrs, 75 questions)\n', bold: true },
      { content: '• Category 1: 50\n• Category 2: 15\n• Category 3: 10', bold: false },
    ],
  },
  {
    id: 3,
    text: [
      { content: 'Paper 2: Physics & Chemistry (2 hrs, 80 questions)\n', bold: true },
      { content: '• Category 1: 30\n• Category 2: 5\n• Category 3: 5', bold: false },
    ],
  },
  {
    id: 4,
    text: [
      { content: 'Marking Scheme:\n', bold: true },
      { content: 'Category 1 → +1 correct, -0.25 incorrect\nCategory 2 → +2 correct, -0.5 incorrect\n', bold: false },
      { content: 'Category 3 (Multiple correct):\n', bold: true },
      { content: '• All correct → +2\n• One correct (others unmarked) → +1\n• One correct + one incorrect → 0\n• All incorrect / unattempted → 0 (No negative marking)', bold: false },
    ],
  },
];

export default instructions;
