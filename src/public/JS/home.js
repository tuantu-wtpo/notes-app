const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const homeHeader = $('.home__header');
const listCharacters = $$('.home__header span');
let index = 0;

const letterLight = setInterval(() => {
  let dartMode = localStorage.getItem('IS_DART_MODE') === 'true';
  listCharacters.forEach((character) => {
    character.classList.remove('text-shadow');
    character.style.color = dartMode ? '#676c8f' : '#ce96fb';
  });
  listCharacters[index].style.color = dartMode ? '#fff' : '#01ffff';
  listCharacters[index].classList.add('text-shadow');
  index++;
  if (index == listCharacters.length) {
    index = 0;
  }
}, 300);
