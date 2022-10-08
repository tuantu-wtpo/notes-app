const Note = require('../model/Note');
const User = require('../model/User');
const { mutilpleMongooseToObject, mongooseToObject, pushIdNote, filterIdNote } = require('../../util/helper');

class NoteController {
  // GET /
  show(req, res, next) {
    try {
      const idUser = req.idUser;
      let Userquery = User.findOne({ _id: idUser });
      let Notequery = Note.find({ owner: idUser });
      let countActive = Note.count({ owner: idUser, completed: { $nin: idUser } });
      let countCompleted = Note.count({ owner: idUser, completed: idUser });

      Promise.all([Userquery, Notequery, countActive, countCompleted])
        .then(([user, notes, countActive, countCompleted]) => {
          res.render('partials/notes', {
            user: mongooseToObject(user),
            idUser,
            countActive,
            countCompleted,
            notes: mutilpleMongooseToObject(notes),
          });
        })
        .catch((error) => {
          res.json({ error: error.message });
        });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /add-note
  stored(req, res, next) {
    try {
      const idUser = req.idUser;
      const noteName = req.body.noteName;
      Note.findOne({ name: noteName })
        .then(async (note) => {
          if (note) {
            let isExistID = note.owner.some((id) => id === idUser);
            if (isExistID) throw new Error('Note already exists!');
            await pushIdNote(note, idUser);
            return res.json({ success: 'Add note successfully!' });
          }
          const newNote = new Note({ name: noteName });
          await pushIdNote(newNote, idUser);
          return res.json({ success: 'Add note successfully!' });
        })
        .catch((error) => {
          res.json({ error: error.message });
        });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // DELETE /remove-note
  deleteNote(req, res, next) {
    try {
      const noteId = req.body.noteId;
      const idUser = req.idUser;
      Note.findById({ _id: noteId })
        .then(async (note) => {
          if (note.owner.length > 1) {
            await filterIdNote(note, idUser);
          } else {
            await Note.deleteOne({ _id: noteId });
          }
          return res.json({ success: 'Delete note successfully!' });
        })
        .catch((error) => {
          res.json({ error: error.message });
        });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // PATCH /update-state-note
  updateStateNote(req, res, next) {
    try {
      const idUser = req.idUser;
      const idNote = req.body.idNote;
      Note.findById({ _id: idNote })
        .then((note) => {
          let isCompleted = note.completed.some((id) => id === idUser);
          if (!isCompleted) {
            note.completed.push(idUser);
          } else {
            note.completed = note.completed.filter((id) => id !== idUser);
          }
          note.save((error) => {
            if (error) throw new Error('Can not set state of note!');
          });
          return res.json({ completed: !isCompleted });
        })
        .catch((error) => {
          res.json({ error: error.message });
        });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // PATCH /update-note-name
  updateNoteName(req, res, next) {
    const idUser = req.idUser;
    const preName = req.body.oldName;
    const newName = req.body.newName;
    const preNotequery = Note.findOne({ name: preName });
    const newNotequery = Note.findOne({ name: newName });
    Promise.all([preNotequery, newNotequery])
      .then(async ([preNote, newNote]) => {
        const isOnlyOne = preNote.owner.length <= 1;
        if (newNote) {
          await pushIdNote(newNote, idUser);
          if (!isOnlyOne) {
            await filterIdNote(preNote, idUser);
          } else {
            await Note.deleteOne({ name: preName });
          }
          return res.json({ success: 'Update note name successfully!', note: newNote });
        }
        if (isOnlyOne) {
          preNote.name = newName;
          preNote.completed = [];
          preNote.save((error) => {
            if (error) throw new Error(error.message);
          });
          return res.json({ success: 'Update note name successfully!', note: preNote });
        }
        let createNote = new Note({ name: newName });
        await pushIdNote(createNote, idUser);
        await filterIdNote(preNote, idUser);
        return res.json({ success: 'Update note name successfully!', note: createNote });
      })
      .catch((error) => {
        res.json({ error: error.message });
      });
  }

  // DELETE /clear-completed-notes
  clearCompletedNotes(req, res, next) {
    try {
      const idUser = req.idUser;
      Note.find({ completed: idUser })
        .then((notes) => {
          notes.forEach(async (note) => {
            if (note.owner.length > 1) {
              filterIdNote(note, idUser);
            } else {
              await Note.deleteOne({ name: note.name });
            }
          });
          res.json({ success: 'Clear completed notes successfully!' });
        })
        .catch((error) => {
          res.json({ error: error.message });
        });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new NoteController();
