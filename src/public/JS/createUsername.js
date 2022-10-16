const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const inputUsername = $("#userName");
const btnSubmit = $(".btn-submit");

btnSubmit.onclick = async (e) => {
  const userName = inputUsername.value;
  const id = btnSubmit.dataset.id;
  const err = checkValidate("username", userName);
  if (!err) {
    animatePart.style.display = "block";
    const host = window.location.host;
    const url = `https://${host}/login/create-username`;
    const data = { userName, id };
    const res = await axios.post(url, data);
    const result = res.data;
    const key = Object.keys(result)[0];
    const message = result[key];
    const urlRedirect = result.url || res.request.responseURL;
    animatePart.style.display = "none";
    return showNotify(key, message, urlRedirect);
  }
};
