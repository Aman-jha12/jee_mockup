export type InstructionPart = { content: string; bold?: boolean };

export type Instruction = {
  id: string | number;
  text: InstructionPart[];
};

// Minimal card for mock-test notice, and a single detailed card for paper/marking info
export const instructions: Instruction[] = [
  {
    id: 1,
    text: [{ content: 'Please note this is a mock based test', bold: true }],
  },
  {
    id: 2,
    text: [
      { content: 'Total Papers: ', bold: true },
      { content: '2\n', bold: false },
      { content: 'Total Duration: ', bold: true },
      { content: '4 hours', bold: false },
    ],
  },
  {
    id: 3,
    text: [
      { content: 'Paper 1: Mathematics', bold: true },
      { content: '\nDuration: ', bold: true },
      { content: '2 hours', bold: false },
      { content: '\nTotal Questions: ', bold: true },
      { content: '75', bold: false },
      { content: '\n\nBreakdown:', bold: true },
      { content: '\nCategory 1: ', bold: true },
      { content: '50 questions', bold: false },
      { content: '\nCategory 2: ', bold: true },
      { content: '15 questions', bold: false },
      { content: '\nCategory 3: ', bold: true },
      { content: '10 questions', bold: false },
      { content: '\n\nPaper 2: Physics and Chemistry', bold: true },
      { content: '\nDuration: ', bold: true },
      { content: '2 hours', bold: false },
      { content: '\nTotal Questions: ', bold: true },
      { content: '80', bold: false },
      { content: '\n\nBreakdown:', bold: true },
      { content: '\nCategory 1: ', bold: true },
      { content: '30 questions', bold: false },
      { content: '\nCategory 2: ', bold: true },
      { content: '5 questions', bold: false },
      { content: '\nCategory 3: ', bold: true },
      { content: '5 questions', bold: false },
    ],
  },
  {
    id: 4,
    text: [
      { content: 'Marking Scheme', bold: true },
      { content: '\n\nCategory 1', bold: true },
      { content: '\nCorrect Answer: ', bold: true },
      { content: '+1', bold: false },
      { content: '\nIncorrect Answer: ', bold: true },
      { content: '-0.25', bold: false },
      { content: '\n\nCategory 2', bold: true },
      { content: '\nCorrect Answer: ', bold: true },
      { content: '+2', bold: false },
      { content: '\nIncorrect Answer: ', bold: true },
      { content: '-0.5', bold: false },
      { content: '\n\nCategory 3 (Multiple Correct Answers Possible)', bold: true },
      { content: '\nAll correct options selected: ', bold: true },
      { content: '+2', bold: false },
      { content: '\nOnly one correct option selected (others left unmarked): ', bold: true },
      { content: '+1', bold: false },
      { content: '\nOne correct and one incorrect option selected: ', bold: true },
      { content: '0', bold: false },
      { content: '\nAll options incorrect: ', bold: true },
      { content: '0', bold: false },
      { content: '\nNo negative marking', bold: true },
    ],
  },
];

export default instructions;
