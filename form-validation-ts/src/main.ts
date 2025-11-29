import { validatedForm, validObj } from './validation';
import './style.css';

const insuranceForm = document.getElementById("insuranceForm") as HTMLFormElement | null;
const inputField = document.querySelectorAll<HTMLElement>("[data-valided]");
const nriYesRadio = document.querySelector("#nri-yes") as HTMLInputElement | null;
const nriNoRadio = document.querySelector("#nri-no") as HTMLInputElement | null;

interface ValidatedResponse {
  valid: boolean;
  data?: Record<string, any>;
}

inputField.forEach((input) => {
  input.addEventListener("change", (event) => {
    const target = event.target as HTMLElement;
    const key = target.getAttribute("data-valided");
    if (!key) return;

    const formGroup = target.closest(".form-group");
    validObj[key]?.(formGroup);
  });

  input.addEventListener("input", (event) => {
    const target = event.target as HTMLElement;
    const key = target.getAttribute("data-valided");
    if (!key) return;

    const formGroup = target.closest(".form-group");
    validObj[key]?.(formGroup);
  });
});

insuranceForm?.addEventListener("submit", (event: SubmitEvent) => {
  event.preventDefault();

  const form = event.target as HTMLFormElement;
  const response = validatedForm(form) as ValidatedResponse;

  if (!response.valid) {
    alert("Invalid");
    return;
  }

  console.log("response", response.data);
});

nriYesRadio?.addEventListener("change", (event) => {
  const ele = event.target as HTMLInputElement;

  const parentEl = ele.closest("form") as HTMLFormElement | null;
  if (!parentEl) return;

  const countryCode = parentEl.querySelector(".country-code") as HTMLInputElement | null;
  const phoneNumber = parentEl.querySelector(".phone-number") as HTMLInputElement | null;

  if (!countryCode || !phoneNumber) return;

  if (ele.checked) {
    countryCode.value = "";
    countryCode.removeAttribute("readonly");
    countryCode.setAttribute("data-valided", "internationalCode");

    phoneNumber.value = "";
    phoneNumber.setAttribute("data-valided", "internationalPhone");
  }
});

nriNoRadio?.addEventListener("change", (event) => {
  const ele = event.target as HTMLInputElement;

  const parentEl = ele.closest("form") as HTMLFormElement | null;
  if (!parentEl) return;

  const countryCode = parentEl.querySelector(".country-code") as HTMLInputElement | null;
  const phoneNumber = parentEl.querySelector(".phone-number") as HTMLInputElement | null;

  if (!countryCode || !phoneNumber) return;

  if (ele.checked) {
    countryCode.value = "91";
    countryCode.setAttribute("readonly", "readonly");
    countryCode.setAttribute("data-valided", "indiaCode");

    phoneNumber.value = "";
    phoneNumber.setAttribute("data-valided", "indianPhone");
  }
});
