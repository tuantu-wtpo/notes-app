const express = require("express");
const router = express.Router();
const NoteController = require("../app/controllers/NoteController");

router.post("/note", NoteController.stored);
router.delete("/note", NoteController.deleteNote);
router.patch("/state-note", NoteController.updateStateNote);
router.patch("/note-name", NoteController.updateNoteName);
router.delete("/completed-notes", NoteController.clearCompletedNotes);
router.get("/", NoteController.show);

module.exports = router;
