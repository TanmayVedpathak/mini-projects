type OptionsObj = {
    id: number;
    text: string;
};

type SingleQuestion = {
    id: number;
    questionText: string;
    options: OptionsObj[];
    correctAnswer: string;
};

type QuestionGroup = {
    id: number;
    title: string;
    questions: SingleQuestion[];
};

export type { QuestionGroup };
