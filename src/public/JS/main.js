const html = document.documentElement;
const appBg = $(".app-bg");
const animatePart = $(".load-animate");
const btnToggleModeOn = $(".toggle-mode-on");
const btnToggleModeOff = $(".toggle-mode-off");
const numberBgImage = 18;
let isDartMode = localStorage.getItem("IS_DART_MODE") === "true";
let data_them = isDartMode ? "dark" : "light";

const bgFilter = document.createElement("div");
bgFilter.classList.add("bg-filter");
appBg.prepend(bgFilter);

html.setAttribute("data-theme", data_them);
btnToggleModeOn.style.display = isDartMode ? "block" : "none";
btnToggleModeOff.style.display = isDartMode ? "none" : "block";
bgFilter.style.display = isDartMode ? "block" : "none";

btnToggleModeOn.onclick = (e) => {
  localStorage.setItem("IS_DART_MODE", false);
  html.setAttribute("data-theme", "light");
  handleDisplay([btnToggleModeOff], [e.target, bgFilter]);
};

btnToggleModeOff.onclick = (e) => {
  localStorage.setItem("IS_DART_MODE", true);
  html.setAttribute("data-theme", "dark");
  handleDisplay([btnToggleModeOn, bgFilter], [e.target]);
};

setBgSize(numberBgImage);
setBgPosition(numberBgImage);
renderBackground();

// Create function to get image background from server
async function renderBackground() {
  const url = `/background`;
  const res = await axios.get(url);
  const imgArr = res.data.imgArr;
  const urlArr = imgArr.map((url, i) => {
    return `url(${url})`;
  });
  bgInterval = setInterval(() => {
    setBgSize(numberBgImage);
    setBgPosition(numberBgImage);
    setBgImage(numberBgImage, urlArr);
  }, 5000);
}

// Create function to set image background
function setBgImage(number = 1, urlArr = []) {
  const urlNumber = urlArr.length;
  var w = window.innerWidth;
  let backgroundImgString;
  if (urlNumber) {
    const imgArr = [];
    const radomArr = [];
    let radom;
    for (let i = 0; i < number; i++) {
      do {
        radom = Math.floor(Math.random() * urlNumber);
      } while (radomArr.some((num) => num === radom));
      radomArr.push(radom);
      imgArr.push(urlArr[radom]);
    }
    if (w <= 575) {
      backgroundImgString = `${urlArr[radom]}`;
    } else {
      backgroundImgString = `${imgArr.join(",")}`;
    }
    appBg.style.backgroundImage = backgroundImgString;
  }
}

// Create function to define backgroundSize
function setBgSize(number = 1) {
  var w = window.innerWidth;
  let arrOfBgSize = [];
  let a, b;
  let random;

  if (w >= 1024) {
    a = 15;
    b = 10;
  } else if (w > 740 && w < 1024) {
    a = 20;
    b = 15;
  } else {
    a = 30;
    b = 25;
  }
  for (let i = 0; i < number; i++) {
    do {
      random = Math.random() * 100;
    } while (random > a || random < b);
    arrOfBgSize.push(random);
  }
  const bgSize = arrOfBgSize.map((size) => `${size}%`);
  appBg.style.backgroundSize = w > 575 ? bgSize.join(",") : `${random * 2}%`;
}

// Create function to define backgroundPosition
function setBgPosition(number = 1) {
  var w = window.innerWidth;
  const arrOfBgPosX = [];
  const arrOfBgPosY = [];
  let randomX;
  let randomY;
  for (let i = 0; i < number; i++) {
    do {
      randomX = Math.random() * 100;
    } while (randomX < 55 && randomX > 45);
    arrOfBgPosX.push(randomX);

    do {
      randomY = Math.random() * 100;
    } while (randomY < 55 && randomY > 45);
    arrOfBgPosY.push(randomY);
  }

  let bgPos = arrOfBgPosX.map((x, i) => {
    return `${x}% ${arrOfBgPosY[i]}%`;
  });

  appBg.style.backgroundPosition = w > 575 ? bgPos.join(",") : `${randomY}% ${randomY}%`;
}

// Function show notify in all app
function showNotify(key, message, url) {
  const main = $(".show-notify");
  const states = { success: "success", error: "error" };
  const state = states[key];
  const icons = {
    success: "fa-check-circle",
    error: "fa-exclamation-circle",
  };
  if (state) {
    const showNotiElement = document.createElement("div");
    showNotiElement.classList.add(`show-notify__container`, `notify-${state}`);
    showNotiElement.innerHTML = `
            <div class="show-notify__icon">
                <i class="fa ${icons[state]}"></i>
            </div>
            <div class="show-notify__body">
                <div class="show-notify__title">${state}</div>
                <div class="show-notify__message">${message}</div>
            </div>
            <div class="show-notify__close">
                <i class="fa-solid fa-xmark"></i>
            </div>
        `;

    main.appendChild(showNotiElement);

    const autoRemoveShowNotify = setTimeout(() => {
      main.removeChild(showNotiElement);
      if (state !== "error") {
        return url ? window.location.replace(url) : window.location.reload();
      }
    }, 4000);

    showNotiElement.onclick = (e) => {
      if (e.target.closest(".show-notify__close")) {
        main.removeChild(showNotiElement);
        clearTimeout(autoRemoveShowNotify);
        if (state !== "error") {
          return url ? window.location.replace(url) : window.location.reload();
        }
      }
    };
  } else return url ? window.location.replace(url) : window.location.reload();

  return state;
}

// Validate in all app
let validator = {
  required(type, value) {
    const message = value ? undefined : `${type[0].toUpperCase() + type.slice(1)} can't be a space!`;
    return message ? showNotify("error", message) : null;
  },

  isEmail(value) {
    const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const message = regex.test(value) ? undefined : "Email is invalid!";
    return message ? showNotify("error", message) : null;
  },

  isPhone(value) {
    const regex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/g;
    const message = regex.test(value) ? undefined : "Phone is not a number!";
    return message ? showNotify("error", message) : null;
  },

  checkPass(value) {
    const isLength = value.trim().length < 6;
    const message = isLength ? "Password must be at least 6 characters!" : undefined;
    return message ? showNotify("error", message) : null;
  },

  confirmPass(pass, confirmPass) {
    const isPass = pass === confirmPass;
    const message = isPass ? undefined : "Confirm password do not match!";
    return message ? showNotify("error", message) : null;
  },
};

function checkValidate(type, value, confirmValue) {
  let err = null;

  switch (type) {
    case "email":
      err = validator.isEmail(value);
      break;
    case "phone":
      err = validator.isPhone(value);
      break;
    case "password":
      err = validator.checkPass(value);
      break;
    case "newPass":
      err = validator.checkPass(value);
      break;
    case "confirmNewPass":
      err = validator.confirmPass(value, confirmValue);
      break;
    default:
      err = validator.required(type, value);
  }
  return err;
}

function handleDisplay(el1, el2) {
  if (el1) {
    el1.forEach((el) => (el.style.display = "block"));
  }
  if (el2) {
    el2.forEach((el) => (el.style.display = "none"));
  }
}
