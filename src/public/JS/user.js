const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const btnModifyInfors = $$(".btn-modifier-infor");
const iptModifyInfors = $$(".infor-modifier");
const inforTitles = $$(".infor-title");
const confirmModifyParts = $$(".confirm-modifier");
const btnConfirmModifys = $$(".confirm-modifier .btn-confirm");
const btnCancelModifys = $$(".confirm-modifier .btn-cancel");
const avatarImg = $(".user-avatar-img");
const avatarOption = $(".user-avatar-options");
const btnChangeAvatar = $(".change-avatar");
const inputChangeAvatar = $("#imageFile");
const avatarModifyPart = $(".avatar-modifier");
const btnConfirmChangeAvatar = $(".btn-avatar-confirm");
const btnCancelChangeAvatar = $(".btn-avatar-cancel");
const btnChangePass = $(".change-password__btn");
const formChangePass = $(".change-password__form");
const btnCancelChangePass = $(".change-password .btn-cancel");
const btnConfirmChangePass = $(".change-password .btn-confirm");
const inputUpdatePasswords = $$(".change-password__input");
const iconPart = $$(".icon-state");
const showPassIcons = $$(".icon-show-pass");
const hidePassIcons = $$(".icon-hide-pass");
let avatarSrcOriginal = avatarImg.src;
let imgAvatarString;

avatarImg.onclick = (e) => {
  e.stopPropagation();
  avatarOption.style.display = "block";
};

avatarOption.onclick = (e) => {
  e.stopPropagation();
  avatarOption.style.display = "none";
};

document.onclick = (e) => {
  avatarOption.style.display = "none";
  btnCancelModifys.forEach((btn) => btn.click());
};

btnChangeAvatar.onclick = (e) => {
  inputChangeAvatar.click();
};

inputChangeAvatar.onchange = (e) => {
  let file = inputChangeAvatar.files[0];
  let reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onloadend = () => {
    imgAvatarString = reader.result;
    avatarImg.src = imgAvatarString;
  };
  avatarModifyPart.style.display = "block";
};

btnCancelChangeAvatar.onclick = () => {
  avatarModifyPart.style.display = "none";
  inputChangeAvatar.value = "";
  avatarImg.src = avatarSrcOriginal;
};

btnConfirmChangeAvatar.onclick = async () => {
  const data = { fileString: imgAvatarString };
  const url = "/user/image-avatar";
  const res = await callServer(url, "POST", data);
  const { key, message } = res;
  showNotify(key, message, "Not redirect");
  if (key === "success") {
    avatarSrcOriginal = imgAvatarString;
  }
  avatarModifyPart.style.display = "none";
};

btnModifyInfors.forEach((btn, i) => {
  btn.onclick = (e) => {
    e.stopPropagation();
    handleDisplay([iptModifyInfors[i], confirmModifyParts[i]], [inforTitles[i], btnModifyInfors[i]]);
    iptModifyInfors[i].focus();
  };
});

btnConfirmModifys.forEach((btn, i) => {
  btn.onclick = async (e) => {
    btnCancelModifys[i].click();

    const type = iptModifyInfors[i].name;
    const value = iptModifyInfors[i].value;
    let err = checkValidate(type, value);
    if (!err) {
      const url = `${window.location.href}/${type}`;
      const data = { [type]: value };
      const res = await callServer(url, "PATCH", data);
      const { key, message, email } = res;
      if (key === "error") return showNotify(key, message);
      if (type === "email") {
        const urlRedirect = `${url}/verify-code?e=${email}`;
        showNotify(key, message, urlRedirect);
      } else {
        showNotify(key, message, "Not redirect");
        inforTitles[i].innerText = value;
      }
    }
  };
});

btnCancelModifys.forEach((btn, i) => {
  btn.onclick = () => {
    handleDisplay([inforTitles[i], btnModifyInfors[i]], [iptModifyInfors[i], confirmModifyParts[i]]);
  };
});

iptModifyInfors.forEach((input, i) => {
  input.onkeyup = (e) => {
    if (e.keyCode === 27) {
      btnCancelModifys[i].click();
    }
    if (e.keyCode === 13) {
      btnConfirmModifys[i].click();
    }
  };

  input.onclick = (e) => e.stopPropagation();
});

inputUpdatePasswords.forEach((input, i) => {
  input.oninput = (e) => {
    const isValue = e.target.value;
    iconPart[i].classList.toggle("active", isValue);
  };
});

showPassIcons.forEach((icon, i) => {
  icon.onclick = (e) => showPass(true, i);
});

hidePassIcons.forEach((icon, i) => {
  icon.onclick = (e) => showPass(false, i);
});

btnChangePass.onclick = (e) => {
  handleDisplay([formChangePass], [btnChangePass]);
};

btnCancelChangePass.onclick = (e) => {
  handleDisplay([btnChangePass], [formChangePass]);
};

btnConfirmChangePass.onclick = async (e) => {
  btnCancelChangePass.click();

  let oldPass = formChangePass.querySelector('input[name="oldPass"]').value;
  let newPass = formChangePass.querySelector('input[name="newPass"]').value;
  let confirmNewPass = formChangePass.querySelector('input[name="confirmNewPass"]').value;
  let err = checkValidate("newPass", newPass) || checkValidate("confirmNewPass", newPass, confirmNewPass);

  if (!err) {
    const url = "/user/password";
    const data = { oldPass, newPass };
    const result = await callServer(url, "PATCH", data);
    const { key, message } = result;
    showNotify(key, message, "Not redirect");
    if (key === "success") {
      formChangePass.querySelector('input[name="oldPass"]').value = "";
      formChangePass.querySelector('input[name="newPass"]').value = "";
      formChangePass.querySelector('input[name="confirmNewPass"]').value = "";
    }
  }
};

async function callServer(url, method, data) {
  animatePart.style.display = "block";
  const options = { url, method, data };
  const res = await axios(options);
  animatePart.style.display = "none";
  const result = res.data;
  const key = Object.keys(result)[0];
  const message = result[key];
  const email = result.email;
  return { key, message, email };
}

function showPass(isShowPass, i) {
  showPassIcons[i].classList.toggle("active", !isShowPass);
  hidePassIcons[i].classList.toggle("active", isShowPass);
  inputUpdatePasswords[i].type = isShowPass ? "text" : "password";
  inputUpdatePasswords[i].focus();
}
