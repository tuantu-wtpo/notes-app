const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const inputUsername = $("#userName");
const inputPassword = $("#password");
const iconPart = $(".icon-state");
const iconShowPass = $(".icon-show-pass");
const iconHidePass = $(".icon-hide-pass");
const btnSubmit = $(".btn-submit");

inputUsername.onkeyup = (e) => {
  if (e.keyCode === 13) return btnSubmit.onclick();
};
inputPassword.oninput = (e) => {
  const isValue = e.target.value;
  iconPart.classList.toggle("active", isValue);
};
inputPassword.onkeyup = (e) => {
  if (e.keyCode === 13) return btnSubmit.onclick();
};

iconShowPass.onclick = (e) => showPass(true);
iconHidePass.onclick = (e) => showPass(false);

btnSubmit.onclick = async (e) => {
  const userName = inputUsername.value;
  const password = inputPassword.value;
  let err = checkValidate("username", userName) || checkValidate("password", password);

  if (!err) {
    animatePart.style.display = "block";
    const url = window.location.pathname;
    const data = { userName, password };
    const res = await axios.post(url, data);
    const result = res.data;
    const key = Object.keys(result)[0];
    const message = result[key];
    animatePart.style.display = "none";
    if (key === "error") return showNotify(key, message);
    window.location.replace(res.request.responseURL);
  }
};

function showPass(isShowPass) {
  iconShowPass.classList.toggle("active", !isShowPass);
  iconHidePass.classList.toggle("active", isShowPass);
  inputPassword.type = isShowPass ? "text" : "password";
  inputPassword.focus();
}
