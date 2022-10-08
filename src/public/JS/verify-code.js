const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const countDownEl = $('.count-down');
const btnConfirm = $('.btn.btn-confirm');
const btnResend = $('.btn.btn-resend');
const inputCodes = $$('.input-code');
let time = countDownEl.dataset.time;
const email = btnResend.dataset.email;
const userName = btnResend.dataset.username;

setInterval(countDown, 1000);

function countDown() {
  if (time <= 0) return clearInterval(countDown);
  time--;
  countDownEl.innerHTML = `${time}s`;
}

inputCodes.forEach((input, i) => {
  input.oninput = () => {
    if (input.value !== '' && i < inputCodes.length - 1) {
      inputCodes[i + 1].value = '';
      inputCodes[i + 1].focus();
    }
  };

  input.onkeyup = (e) => {
    if (e.keyCode === 13) {
      btnConfirm.click();
    }
  };
});

btnResend.onclick = async () => {
  try {
    const url = window.location.pathname.replace('/verify-code', '');
    const data = { email, userName };
    const result = await callServer(url, data, 'PATCH');
    const { key, message } = result;
    showNotify(key, message);
  } catch (error) {
    showNotify('error', error.message);
  }
};

btnConfirm.onclick = async () => {
  try {
    let code = Array.from(inputCodes).reduce((code, input) => {
      return code + input.value;
    }, '');
    const url = window.location.href;
    const data = { email, userName, code };
    const result = await callServer(url, data, 'POST');
    const { key, message, token } = result;
    const path = window.location.pathname.replace('/email/verify-code', '');
    let urlRedirect = path.includes('user') ? path : path + `?u=${userName}&t=${token}`;
    showNotify(key, message, urlRedirect);
  } catch (error) {
    showNotify('error', error.message);
  }
};

async function callServer(url, data, method) {
  animatePart.style.display = 'block';
  const options = { url, method, data };
  let res = await axios(options);
  let result = res.data;
  const key = Object.keys(result)[0];
  const message = result[key];
  const token = result.token;
  animatePart.style.display = 'none';
  return { key, message, token };
}
