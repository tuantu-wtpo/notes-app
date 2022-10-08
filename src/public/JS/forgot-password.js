const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const formForgotPassword = $('.forgot-password');
const btnSubmit = $('.btn-submit');
const inputUsername = $('#userName');
const inputUpdatePasswords = $$('.input-update-pass');
const iconPart = $$('.icon-state');
const showPassIcons = $$('.icon-show-pass');
const hidePassIcons = $$('.icon-hide-pass');

let userName;
let newPass;
let confirmNewPass;

formForgotPassword.onsubmit = (e) => {
  e.preventDefault();
};

inputUpdatePasswords.forEach((input, i) => {
  input.oninput = (e) => {
    const isValue = e.target.value;
    iconPart[i].classList.toggle('active', isValue);
  };

  input.onkeyup = (e) => {
    if (e.keyCode === 13) {
      btnSubmit.click();
    }
  };
});

showPassIcons.forEach((icon, i) => {
  icon.onclick = (e) => showPass(true, i);
});

hidePassIcons.forEach((icon, i) => {
  icon.onclick = (e) => showPass(false, i);
});

btnSubmit.onclick = async (e) => {
  let err = null;
  if (inputUsername) {
    userName = inputUsername.value;
  } else {
    userName = e.target.dataset.username;
    token = e.target.dataset.token;
    newPass = $('#newPass').value;
    confirmNewPass = $('#confirmNewPass').value;
    err = checkValidate('newPass', newPass) || checkValidate('confirmNewPass', newPass, confirmNewPass);
  }

  if (!err) {
    animatePart.style.display = 'block';
    const url = inputUsername ? `${window.location.pathname}/email` : `${window.location.pathname}/change-password`;
    const data = inputUsername ? { userName } : { userName, newPass, token };
    const result = await callServer(url, data, 'POST', inputUsername);
    animatePart.style.display = 'none';
    const { key, message, urlRedirect } = result;
    showNotify(key, message, urlRedirect);
  }
};

async function callServer(url, data, method, inputUsername) {
  const options = { url, method, data };
  const res = await axios(options);
  const result = res.data;
  const key = Object.keys(result)[0];
  const message = result[key];
  const urlRedirect = inputUsername ? `${url}/verify-code?e=${result.email}&u=${data.userName}` : '/login';
  return { key, message, urlRedirect };
}

function showPass(isShowPass, i) {
  showPassIcons[i].classList.toggle('active', !isShowPass);
  hidePassIcons[i].classList.toggle('active', isShowPass);
  inputUpdatePasswords[i].type = isShowPass ? 'text' : 'password';
  inputUpdatePasswords[i].focus();
}
