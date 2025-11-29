import { QuestionGroup } from './type.ts';
import addEvent from './biz.ts';

const app = document.getElementById('app') as HTMLDivElement;

export default function renderQuiz(quizObj: QuestionGroup[]): void {
    const questions = document.createElement('div');
    questions.classList.add('questions');

    quizObj.map((category, index) => {
        category['questions'].map((questionObj, ind) => {
            const question = document.createElement('div');
            question.classList.add('question');
            if (index == 0 && ind == 0) {
                question.classList.add('active');
            }
            question.setAttribute('data-correct-answer', questionObj.correctAnswer);
            question.setAttribute('data-selected-option', '');

            const questionText = document.createElement('div');
            questionText.classList.add('question__text');
            questionText.textContent = questionObj.questionText;


            const questionOptions = document.createElement('div');
            questionOptions.classList.add('question__options');
            questionObj.options.map((optionObj) => {
                const questionOption = document.createElement('div');
                questionOption.classList.add('question__option');
                questionOption.setAttribute('data-option', String(optionObj.id));
                questionOption.innerHTML = `
            <input type="radio" name="${questionObj.id}" id="${questionObj.id}-${optionObj.id}">
            <label for="${questionObj.id}-${optionObj.id}">${optionObj.text}</label>
          `;

                questionOptions.append(questionOption)
            });

            question.append(questionText);
            question.append(questionOptions);

            questions.append(question);
        })
    });

    app.append(questions);
    app.innerHTML += `
      <div class="buttons">
        <button class="btns previous" disabled>Previous</button>
        <button class="btns next">Next</button>
    </div>
        <button class="btns submit" style="display: none;">Submit</button>
    `;

    addEvent();
}