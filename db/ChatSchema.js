const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const chatSchema = new Schema(
  {
    messages: [
      {
        message: String,
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        meta: [
          {
            delivered: Boolean,
            read: Boolean
          }
        ]
      }
    ],
    is_group_message: { type: Boolean, default: false },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  {
    timestamps: true
  }
);

let Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;
