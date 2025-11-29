export default function addEvent(): void {
  const previousBtn = document.querySelector(".previous") as HTMLButtonElement;
  const nextBtn = document.querySelector(".next") as HTMLButtonElement;
  const submitBtn = document.querySelector(".submit") as HTMLButtonElement;
  const radioInputs = document.querySelectorAll(".question__option input");

  submitBtn.addEventListener('click', () => {
    const questionList = document.querySelectorAll(".question");

    questionList.forEach((question) => {
      if(question.getAttribute('data-selected-option')) {
        if(question.getAttribute('data-correct-answer') == question.querySelector('.question__option.checked')?.getAttribute('data-option')) {
          question.querySelector('.question__option.checked')?.classList.add("correct");
        } else {
          question.querySelector('.question__option.checked')?.classList.add("wrong");
          const correctAnswer = question.getAttribute('data-correct-answer');
          const correctOption = question.querySelector(`[data-option="${correctAnswer}"]`);
          correctOption?.classList.add("correct");

        }
      }
    });
  });

  previousBtn.addEventListener("click", function (): void  {
    const activeQuestion = document.querySelector(".question.active");
    activeQuestion?.classList.remove("active");
    activeQuestion?.previousElementSibling?.classList.add("active");
    if (document.querySelector(".question.active")?.previousElementSibling) {
      previousBtn.removeAttribute('disabled');
    } else {
      previousBtn.setAttribute('disabled', 'disabled');
    }

    if (document.querySelector(".question.active")?.nextElementSibling) {
      nextBtn.removeAttribute('disabled');
      submitBtn.style.display = "none";
    } else {
      nextBtn.setAttribute('disabled', 'disabled');
      submitBtn.style.display = "block";
    }
  });

  nextBtn.addEventListener("click", function (): void  {
    const activeQuestion = document.querySelector(".question.active");
    activeQuestion?.classList.remove("active");
    activeQuestion?.nextElementSibling?.classList.add("active");
    if (document.querySelector(".question.active")?.nextElementSibling) {
      nextBtn.removeAttribute('disabled');
      submitBtn.style.display = "none";
    } else {
      nextBtn.setAttribute('disabled', 'disabled');
      submitBtn.style.display = "block";
    }

    if (document.querySelector(".question.active")?.previousElementSibling) {
      previousBtn.removeAttribute('disabled');
    } else {
      previousBtn.setAttribute('disabled', 'disabled');
    }
  });

  radioInputs.forEach((input): void => {
    input.addEventListener('change', ():void => {
      const questionWrapper = input.closest('.question') as HTMLDivElement;
      input.closest('.question__option')?.classList.add("checked");
      questionWrapper.dataset.selectedOption = input.closest('.question__option')?.getAttribute('data-option') || '';
    });
  });
}