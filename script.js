// script.js
const disposableDomains = ["tempmail.com","10minutemail.com","mailinator.com","tempmail.io","guerrillamail.com"];

const countryData = {
  "India": { code: "+91", states: { "Telangana": ["Hyderabad","Warangal"], "Karnataka": ["Bengaluru","Mysore"] } },
  "United States": { code: "+1", states: { "California": ["San Francisco","Los Angeles"], "New York": ["NYC","Buffalo"] } },
  "United Kingdom": { code: "+44", states: { "England": ["London","Manchester"], "Scotland":["Edinburgh","Glasgow"] } }
};

document.addEventListener("DOMContentLoaded", () => {
  populateCountrySelects();
  hookupValidation();
});

// ------------------------------------------------
// Populate Country + Phone Code Dropdowns
// ------------------------------------------------
function populateCountrySelects(){
  const country = document.getElementById("country");
  const countrySelect = document.getElementById("countrySelect");

  for(const k of Object.keys(countryData)){
    const o = document.createElement("option");
    o.value = k; o.textContent = k;
    country.appendChild(o);

    const o2 = document.createElement("option");
    o2.value = k; o2.textContent = `${k} (${countryData[k].code})`;
    countrySelect.appendChild(o2);
  }

  country.value = Object.keys(countryData)[0];
  countrySelect.value = country.value;

  updateStateList();
  updatePhoneCountry();

  country.addEventListener("change", () => {
    updateStateList();
    validateForm();
  });

  countrySelect.addEventListener("change", (e) => { 
    document.getElementById("country").value = e.target.value; 
    updateStateList();
    updatePhoneCountry();
  });
}

// ------------------------------------------------
// Populate States (City is now typed manually)
// ------------------------------------------------
function updateStateList(){
  const country = document.getElementById("country").value;
  const state = document.getElementById("state");

  state.innerHTML = "";

  const states = countryData[country].states;
  for(const s of Object.keys(states)){
    const so = document.createElement("option");
    so.value = s;
    so.textContent = s;
    state.appendChild(so);
  }
}

// ------------------------------------------------
// Update phone placeholder with country code
// ------------------------------------------------
function updatePhoneCountry(){
  const selected = document.getElementById("countrySelect").value;
  const code = countryData[selected].code;
  const phone = document.getElementById("phone");

  if(!phone.value.startsWith("+")) {
    phone.placeholder = `${code}XXXXXXXXXX`;
  }
}

// ------------------------------------------------
// Validation
// ------------------------------------------------
function hookupValidation(){
  const form = document.getElementById("regForm");
  const inputs = {
    firstName: document.getElementById("firstName"),
    lastName: document.getElementById("lastName"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
    city: document.getElementById("city"),     // NEW CITY INPUT
    genderRadios: document.getElementsByName("gender"),
    password: document.getElementById("password"),
    confirmPassword: document.getElementById("confirmPassword"),
    terms: document.getElementById("terms"),
    submitBtn: document.getElementById("submitBtn")
  };

  function showError(id, msg){
    document.getElementById(id+"Error").textContent = msg || "";
  }

  function isDisposable(email){
    const domain = email.split("@")[1] || "";
    return disposableDomains.includes(domain.toLowerCase());
  }

  function getSelectedGender(){
    for(const r of inputs.genderRadios) if(r.checked) return r.value;
    return null;
  }

  // Password strength meter
  inputs.password.addEventListener("input", ()=> {
    const s = strength(inputs.password.value);
    document.getElementById("pwStrength").value = s.score;
    document.getElementById("pwText").textContent = s.label;
  });

  // Validate on input
  ["firstName","lastName","email","phone","confirmPassword","city"].forEach(id=>{
    document.getElementById(id).addEventListener("input", validateForm);
  });

  for(const r of inputs.genderRadios) r.addEventListener("change", validateForm);
  document.getElementById("country").addEventListener("change", validateForm);
  document.getElementById("state").addEventListener("change", validateForm);
  inputs.terms.addEventListener("change", validateForm);

  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    if(!validateForm(true)) return;

    // Success
    document.getElementById("formMessages").textContent =
      "Registration Successful! Your profile has been submitted successfully.";

    form.reset();
    document.getElementById("pwStrength").value = 0;
    document.getElementById("pwText").textContent = "";
    inputs.submitBtn.disabled = true;
  });

  // ------------------------------------------------
  // Main Validation Function
  // ------------------------------------------------
  function validateForm(showAll=false){
    let valid = true;

    // First Name
    if(!inputs.firstName.value.trim()){
      showError("firstName", "First name is required.");
      valid = false;
    } else showError("firstName","");

    // Last Name
    if(!inputs.lastName.value.trim()){
      showError("lastName", "Last name is required.");
      valid = false;
    } else showError("lastName","");

    // Email
    const emailVal = inputs.email.value.trim();
    if(!emailVal){
      showError("email","Email is required.");
      valid=false;
    }
    else if(!/^\S+@\S+\.\S+$/.test(emailVal)){
      showError("email","Enter a valid email.");
      valid=false;
    }
    else if(isDisposable(emailVal)){
      showError("email","Disposable email addresses are not allowed.");
      valid=false;
    }
    else showError("email","");

    // Phone
    const phoneVal = inputs.phone.value.trim();
    const countryCode = countryData[document.getElementById("country").value].code;

    if(!phoneVal){
      showError("phone","Phone is required.");
      valid=false;
    }
    else if(!phoneVal.startsWith("+") && !phoneVal.startsWith(countryCode)){
      showError("phone", `Phone must start with ${countryCode}.`);
      valid=false;
    }
    else if(!/^[\d+]{7,15}$/.test(phoneVal)){
      showError("phone","Enter a valid phone number.");
      valid=false;
    }
    else showError("phone","");

    // Gender
    if(!getSelectedGender()){
      showError("gender","Select gender.");
      valid=false;
    } else showError("gender","");

    // City (typed manually)
    if(!inputs.city.value.trim()){
      showError("city","City is required.");
      valid=false;
    } else showError("city","");

    // Password
    const pw = inputs.password.value;
    const conf = inputs.confirmPassword.value;
    const s = strength(pw);

    if(!pw){
      showError("password","Password is required.");
      valid=false;
    }
    else if(s.score < 2){
      showError("password","Password is too weak.");
      valid=false;
    }
    else showError("password","");

    if(!conf){
      showError("confirmPassword","Confirm password.");
      valid=false;
    }
    else if(conf !== pw){
      showError("confirmPassword","Passwords do not match.");
      valid=false;
    }
    else showError("confirmPassword","");

    // Terms checkbox
    if(!inputs.terms.checked){
      showError("terms","You must accept the terms.");
      valid=false;
    } else showError("terms","");

    inputs.submitBtn.disabled = !valid;
    return valid;
  }
}

// ------------------------------------------------
// Password strength helper
// ------------------------------------------------
function strength(pw){
  let score = 0;
  if(pw.length >= 8) score++;
  if(/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if(/\d/.test(pw)) score++;
  if(/[\W_]/.test(pw)) score++;

  const label = ["Very weak","Weak","Medium","Strong","Very strong"][Math.min(score,4)];
  return {score,label};
}
