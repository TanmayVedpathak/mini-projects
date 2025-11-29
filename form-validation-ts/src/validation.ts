interface ValidationResponse {
  valid: boolean;
  obj?: Record<string, any>;
}

type ValidationFn = (formGroup: Element | null) => ValidationResponse;

function validateFullName(formGroupEl: Element | null): ValidationResponse {
  if (!formGroupEl) return { valid: false };

  const input = formGroupEl.querySelector<HTMLInputElement>('input[name="full-name"]');
  const errorText = formGroupEl.querySelector<HTMLElement>(".error-text");

  if (!input || !errorText) return { valid: false };

  const value = input.value.trim();
  const parts = value.split(/\s+/);

  if (parts.length < 2) {
    errorText.textContent = "Please enter both first and last name.";
    errorText.classList.remove("dsp-n");
    return { valid: false };
  }

  const nameRegex = /^[A-Za-z][A-Za-z'-]{2,}$/;

  for (const part of parts) {
    if (!nameRegex.test(part)) {
      errorText.textContent =
        "Each name should be alphabetic and at least 3 characters.";
      errorText.classList.remove("dsp-n");
      return { valid: false };
    }
  }

  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ");

  errorText.textContent = "";
  errorText.classList.add("dsp-n");

  return {
    valid: true,
    obj: {
      first_name: firstName,
      last_name: lastName,
    },
  };
}

function validateDOB(formGroupEl: Element | null): ValidationResponse {
  if (!formGroupEl) return { valid: false };

  const input = formGroupEl.querySelector<HTMLInputElement>('input[name="dob"]');
  const errorText = formGroupEl.querySelector<HTMLElement>(".error-text");

  if (!input || !errorText) return { valid: false };

  const reqObjKey = input.getAttribute("data-key");

  const dobValue = input.value;
  if (!dobValue) {
    errorText.textContent = "Please select your date of birth.";
    errorText.classList.remove("dsp-n");
    return { valid: false };
  }

  const dob = new Date(dobValue);
  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;

  if (age < 18 || age > 65) {
    errorText.textContent = "Age must be between 18 and 65 years.";
    errorText.classList.remove("dsp-n");
    return { valid: false };
  }

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const formattedDOB =
    ("0" + dob.getDate()).slice(-2) +
    "-" +
    monthNames[dob.getMonth()] +
    "-" +
    dob.getFullYear();

  errorText.textContent = "";
  errorText.classList.add("dsp-n");

  return {
    valid: true,
    obj: { [reqObjKey!]: formattedDOB },
  };
}

function validateEmail(formGroup: Element | null): ValidationResponse {
  if (!formGroup) return { valid: false };

  const input = formGroup.querySelector<HTMLInputElement>('input[type="email"]');
  const errorEl = formGroup.querySelector<HTMLElement>(".error-text");

  if (!input || !errorEl) return { valid: false };

  const key = input.dataset.key || "email";
  const value = input.value.trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  let errorMsg = "";
  let isValid = true;

  if (!value) {
    isValid = false;
    errorMsg = "Please enter your email address";
  } else if (!emailRegex.test(value)) {
    isValid = false;
    errorMsg = "Please enter a valid email address";
  }

  if (!isValid) {
    errorEl.textContent = errorMsg;
    errorEl.classList.remove("dsp-n");
  } else {
    errorEl.textContent = "";
    errorEl.classList.add("dsp-n");
  }

  return { valid: isValid, obj: { [key]: value } };
}

function validateCountryCode_NRI_No(formGroupEl: Element | null): ValidationResponse {
  if (!formGroupEl) return { valid: false };

  const ccInput = formGroupEl.querySelector<HTMLInputElement>('input[name="country-code"]');
  const errorText = formGroupEl.querySelector<HTMLElement>(".error-text");

  if (!ccInput || !errorText) return { valid: false };

  const ccKey = ccInput.getAttribute("data-key");
  if (!ccKey) return { valid: false };

  ccInput.value = ccInput.value.replace(/\D+/g, "");
  const cc = ccInput.value.trim();

  if (cc !== "91") {
    errorText.textContent = "Country code must be 91.";
    errorText.classList.remove("dsp-n");
    return { valid: false };
  }

  errorText.textContent = "";
  errorText.classList.add("dsp-n");

  return { valid: true, obj: { [ccKey]: cc } };
}

function validatePhone_NRI_No(formGroupEl: Element | null): ValidationResponse {
  if (!formGroupEl) return { valid: false };

  const phoneInput = formGroupEl.querySelector<HTMLInputElement>('input[name="phone-number"]');
  const errorText = formGroupEl.querySelector<HTMLElement>(".error-text");

  if (!phoneInput || !errorText) return { valid: false };

  const phoneKey = phoneInput.getAttribute("data-key");
  if (!phoneKey) return { valid: false };

  phoneInput.value = phoneInput.value.replace(/\D+/g, "");
  const phone = phoneInput.value.trim();

  const indianRegex = /^[6-9]\d{9}$/;

  if (!indianRegex.test(phone)) {
    errorText.textContent = "Enter valid 10-digit Indian number.";
    errorText.classList.remove("dsp-n");
    return { valid: false };
  }

  errorText.textContent = "";
  errorText.classList.add("dsp-n");

  return { valid: true, obj: { [phoneKey]: phone } };
}

function validateCountryCode_NRI_Yes(formGroupEl: Element | null): ValidationResponse {
  if (!formGroupEl) return { valid: false };

  const ccInput = formGroupEl.querySelector<HTMLInputElement>('input[name="country-code"]');
  const errorText = formGroupEl.querySelector<HTMLElement>(".error-text");

  if (!ccInput || !errorText) return { valid: false };

  const ccKey = ccInput.getAttribute("data-key");
  if (!ccKey) return { valid: false };

  ccInput.value = ccInput.value.replace(/\D+/g, "");
  const cc = ccInput.value.trim();

  const ccRegex = /^\d{2,4}$/;

  if (!ccRegex.test(cc)) {
    errorText.textContent = "Country code must be 2–4 digits.";
    errorText.classList.remove("dsp-n");
    return { valid: false };
  }

  errorText.textContent = "";
  errorText.classList.add("dsp-n");

  return { valid: true, obj: { [ccKey]: cc } };
}

function validatePhone_NRI_Yes(formGroupEl: Element | null): ValidationResponse {
  if (!formGroupEl) return { valid: false };

  const phoneInput = formGroupEl.querySelector<HTMLInputElement>('input[name="phone-number"]');
  const errorText = formGroupEl.querySelector<HTMLElement>(".error-text");

  if (!phoneInput || !errorText) return { valid: false };

  const phoneKey = phoneInput.getAttribute("data-key");
  if (!phoneKey) return { valid: false };

  phoneInput.value = phoneInput.value.replace(/\D+/g, "");
  const phone = phoneInput.value.trim();

  const phoneRegex = /^\d{7,14}$/;

  if (!phoneRegex.test(phone)) {
    errorText.textContent = "Phone must be 7–14 digits.";
    errorText.classList.remove("dsp-n");
    return { valid: false };
  }

  errorText.textContent = "";
  errorText.classList.add("dsp-n");

  return { valid: true, obj: { [phoneKey]: phone } };
}

function validateSelect(formGroupEl: Element | null): ValidationResponse {
  if (!formGroupEl) return { valid: false };

  const select = formGroupEl.querySelector<HTMLSelectElement>("select[name='income']");
  const errorText = formGroupEl.querySelector<HTMLElement>(".error-text");

  if (!select || !errorText) return { valid: false };

  const value = select.value.trim();

  if (!value) {
    errorText.textContent = "Please select an option.";
    errorText.classList.remove("dsp-n");
    return { valid: false };
  }

  errorText.textContent = "";
  errorText.classList.add("dsp-n");

  const key = select.getAttribute("data-key")!;

  if (!key) return { valid: true, obj: {} };
  
  return { valid: true, obj: { [key]: value } };
}

function validateRadio(formGroup: Element | null): ValidationResponse {
  if (!formGroup) return { valid: false };

  const checkedInput =
    formGroup.querySelector<HTMLInputElement>('input[type="radio"]:checked');

  if (!checkedInput) return { valid: false };

  const key = checkedInput.dataset.key;
  if (!key) return { valid: true, obj: {} };

  return { valid: true, obj: { [key]: checkedInput.value } };
}

export const validObj: Record<string, ValidationFn> = {
  fullName: validateFullName,
  dob: validateDOB,
  email: validateEmail,
  indiaCode: validateCountryCode_NRI_No,
  indianPhone: validatePhone_NRI_No,
  internationalCode: validateCountryCode_NRI_Yes,
  internationalPhone: validatePhone_NRI_Yes,
  dropDown: validateSelect,
  radio: validateRadio,
};

export function validatedForm(form: HTMLFormElement) {
  const formGroups = form.querySelectorAll<HTMLElement>(".form-group");

  const formIsValid: boolean[] = [];
  let reqObj: Record<string, any> = {};

  formGroups.forEach((grp) => {
    const inputFields = grp.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
      "[name]"
    );

    inputFields.forEach((input) => {
      const key = input.getAttribute("data-valided");

      if (key && validObj[key]) {
        const response = validObj[key](grp);

        if (!response.valid) formIsValid.push(false);

        if (response.obj) reqObj = { ...reqObj, ...response.obj };
      }
    });
  });

  return {
    valid: formIsValid.length === 0,
    data: reqObj,
  };
}

