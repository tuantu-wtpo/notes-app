const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const btnAddNote = $(".btn-add-note");
const inputAddNote = $("#addNote");
const noteList = $(".notes__list");
const noteItems = $$(".notes__item");
const btnUpdateStateNotes = $$(".update-state-note");
const noteNames = $$(".notes__item-text");
const formUpdateNotes = $$(".form-update-note");
const inputUpdateNotes = $$(".form-update-note input");
const btnDeleteNotes = $$(".btn-delete-notes-item");
const noteStateList = $(".notes__state-list");
const noteStateSelect = $(".notes__state-select");
const btnFilterStates = $$(".btn-filter-state");
const clearCompletedBtn = $(".btn-clear-notes-completed");
const avatarElement = $(".avatar-owner");

const imgUrl = avatarElement.dataset.avatarurl;
cssVars({
  variables: { "--imgUrl": `url(${imgUrl})` },
});

filterNotes("all");

window.onresize = (e) => {
  let w = window.innerWidth;
  noteStateList.style.display = w > 575 ? "block" : "none";
};

document.onclick = (e) => {
  let w = window.innerWidth;
  if (w <= 575) {
    noteStateList.style.display = "none";
  }
};

inputAddNote.onkeyup = (e) => {
  if (e.keyCode === 13) {
    btnAddNote.click();
  }
  if (e.keyCode === 27) {
    e.target.blur();
  }
};

btnAddNote.onclick = async (e) => {
  const noteName = inputAddNote.value;
  let err = checkValidate("note", noteName);
  if (!err) {
    const data = { noteName };
    const url = "notes/note";
    const res = await callServer(url, "POST", data);
    const { key, message } = res;
    if (key === "error") return showNotify(key, message);
    window.location.reload();
  }
};

btnUpdateStateNotes.forEach((btn, i) => {
  btn.onclick = async (e) => {
    const isActive = noteItems[i].classList.contains("active");
    noteItems[i].classList.toggle("active", !isActive);
    handleShowClearCompleted();
    const idNote = btn.dataset.id;
    const data = { idNote };
    const url = "notes/state-note";
    const res = await callServer(url, "PATCH", data);
  };
});

noteNames.forEach((noteName, i) => {
  noteName.ondblclick = (e) => {
    handleClass(formUpdateNotes[i], e.target);
    inputUpdateNotes[i].focus();
  };

  noteName.onclick = (e) => {
    btnUpdateStateNotes[i].click();
  };
});

inputUpdateNotes.forEach((inputUpdateNote, i) => {
  inputUpdateNote.onblur = () => {
    handleClass(noteNames[i], formUpdateNotes[i]);
  };

  inputUpdateNote.onkeyup = async (e) => {
    if (e.keyCode === 27) {
      e.target.blur();
    }

    if (e.keyCode === 13) {
      const oldName = formUpdateNotes[i].dataset.oldname;
      const newName = e.target.value;
      if (oldName === newName) return showNotify("error", "Note is exists!");
      let err = checkValidate("noteName", newName);
      if (!err) {
        const data = { oldName, newName };
        const url = "notes/note-name";
        const res = await callServer(url, "PATCH", data);
        const { key, message, note } = res;
        if (key === "error") return showNotify(key, message);
        handleUpdateNoteName(note, i);
        e.target.blur();
      }
    }
  };
});

btnDeleteNotes.forEach((btn, i) => {
  btn.onclick = async (e) => {
    noteList.removeChild(noteItems[i]);
    handleShowClearCompleted();
    const noteId = btn.dataset.id;
    const data = { noteId };
    const url = "notes/note";
    const res = await callServer(url, "DELETE", data);
    const { key, message } = res;
    if (key === "error") {
      await showNotify(key, message);
      window.location.reload();
    }
  };
});

clearCompletedBtn.onclick = async (e) => {
  e.target.classList.remove("active");
  handleClearCompletedNote();
  const url = "notes/completed-notes";
  const res = await callServer(url, "DELETE");
  const { key, message } = res;
  if (key === "error") {
    await showNotify(key, message);
    window.location.reload;
  }
};

noteStateSelect.onclick = (e) => {
  e.stopPropagation();
  noteStateList.style.display = "block";
};

btnFilterStates.forEach((btn, i) => {
  btn.onclick = (e) => {
    e.stopPropagation();
    handleClass(e.target, ...btnFilterStates);
    const filter = e.target.dataset.filter;
    filterNotes(filter);
    noteStateSelect.innerText = filter;
    if (window.innerWidth <= 575) {
      noteStateList.style.display = "none";
    }
  };
});

async function callServer(url, method, data) {
  const options = { method, url, data };
  const res = await axios(options);
  const result = res.data;
  const note = result.note;
  const key = Object.keys(result)[0];
  const message = result[key];
  return { key, message, note };
}

function handleClass(el1, ...el2) {
  el2.forEach((el) => el.classList.remove("active"));
  el1.classList.add("active");
}

function handleShowClearCompleted() {
  let countItemLeft = 0;
  const noteItems = Array.from($$(".notes__item"));
  noteItems.forEach((note) => {
    const isActive = note.classList.contains("active");
    countItemLeft = isActive ? countItemLeft : countItemLeft + 1;
  });
  const isShow = noteItems.length > countItemLeft;
  clearCompletedBtn.classList.toggle("active", isShow);
  $(".amount-notes").innerText = `${countItemLeft} items left`;
  const filter = $(".btn-filter-state.active").dataset.filter;
  filterNotes(filter);
}

function handleUpdateNoteName(note, i) {
  noteItems[i].classList.remove("active");
  btnUpdateStateNotes[i].dataset.id = note._id;
  noteNames[i].innerText = note.name;
  formUpdateNotes[i].dataset.oldname = note.name;
  inputUpdateNotes[i].value = note.name;
  handleShowClearCompleted();
}

function handleClearCompletedNote() {
  const noteItems = Array.from($$(".notes__item.active"));
  noteItems.forEach((note) => noteList.removeChild(note));
  const filter = $(".btn-filter-state.active").dataset.filter;
  filterNotes(filter);
}

function filterNotes(filter) {
  const noteItems = Array.from($$(".notes__item"));
  const textNotify = $(".text-notify");

  switch (filter) {
    case "active":
      let countItemLeft = 0;
      noteItems.forEach((note) => {
        const isActive = note.classList.contains("active");
        note.style.display = isActive ? "none" : "flex";
        countItemLeft = isActive ? countItemLeft : countItemLeft + 1;
      });
      textNotify.style.display = countItemLeft === 0 ? "block" : "none";
      break;
    case "completed":
      let countItemCompleted = 0;
      noteItems.forEach((note) => {
        const isActive = note.classList.contains("active");
        note.style.display = isActive ? "flex" : "none";
        countItemCompleted = isActive ? countItemCompleted + 1 : countItemCompleted;
      });
      textNotify.style.display = countItemCompleted === 0 ? "block" : "none";
      break;
    default:
      const isNoNote = noteItems.length === 0;
      noteItems.forEach((note) => (note.style.display = "flex"));
      textNotify.style.display = isNoNote ? "block" : "none";
      break;
  }
}
