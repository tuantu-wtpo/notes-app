const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const inputUsername = $('#userName');
const btnSubmit = $('.btn-submit');

btnSubmit.onclick = async (e) => {
  const userName = inputUsername.value;
  const id = btnSubmit.dataset.id;
  const err = checkValidate('username', userName);
  if (!err) {
    const host = window.location.host;
    const url = `https://${host}/login/create-username`;
    const data = { userName, id };
    const res = await axios.post(url, data);
    const result = res.data;
    const key = Object.keys(result)[0];
    const message = result[key];
    if (key === 'error') return showNotify(key, message);
    window.location.replace(res.request.responseURL);
  }
};
