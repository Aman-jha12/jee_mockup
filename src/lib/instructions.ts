export type InstructionPart = { content: string; bold?: boolean };

export type Instruction = {
  id: string | number;
  text: InstructionPart[];
};

export const instructions: Instruction[] = [
  {
    id: 1,
    text: [{ content: 'Please note this is a mock based test\n', bold: true },
      { content: 'Total Papers: 2 | Total Duration: 4 hours', bold: true },
    ],
  },
  {
    id: 2,
    text: [
      { content: 'Paper 1: Mathematics (2 hrs, 75 questions)\n', bold: true },
      { content: '• Category 1: 50    • Category 2: 15    • Category 3: 10', bold: false },
    ],
  },
  {
    id: 3,
    text: [
      { content: 'Paper 2: Physics & Chemistry (2 hrs, 80 questions)\n', bold: true },
      { content: '• Category 1: 30 • Category 2: 5 • Category 3: 5', bold: false },
    ],
  },
  {
    id: 4,
    text: [
      { content: 'Marking Scheme: ', bold: true },
      { content: 'C1 (+1/-0.25) | C2 (+2/-0.5) | C3 (Multiple Correct)\n', bold: false },
      { content: '• Correct: +2 • Partial: +1 • Others: 0 (No negative marking)', bold: false },
    ],
  },
];

export default instructions;
