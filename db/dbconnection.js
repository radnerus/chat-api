const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const url =
  'mongodb+srv://suren:Suren@93@radnerus-chat-maoyv.mongodb.net/chat-db?retryWrites=true&w=majority';
const connect = mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
});
module.exports = connect;
