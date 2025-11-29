import { QuestionGroup } from './type.ts';
import renderQuiz from './render.ts';

let quizObj: QuestionGroup[];

fetch('../data/quiz.json')
  .then((res) => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  })
  .then((data) => {
    quizObj = data;
    renderQuiz(quizObj);
  })
  .catch((err) => {
    console.error("Error:", err);
  });