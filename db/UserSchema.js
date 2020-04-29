const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema(
  {
    email: {
      type: String,
      unique: true
    },
    displayName: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

let User = mongoose.model('User', userSchema);
module.exports = User;
