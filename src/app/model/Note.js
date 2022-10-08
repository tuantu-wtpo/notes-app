const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Note = new Schema({
  name: { type: 'string', default: '' },
  completed: { type: 'array', default: [] },
  owner: { type: 'array', default: [] },
});

module.exports = mongoose.model('Note', Note);
