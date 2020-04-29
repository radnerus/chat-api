const port = PORT || 4000;
const client = require('socket.io').listen(PORT).sockets;
const Chat = require('./db/ChatSchema');
const User = require('./db/UserSchema');
const connect = require('./db/dbconnection');
var ObjectId = require('mongodb').ObjectID;

const userIds = {};

connect.then(async (db) => {
  console.log('MongoDB connected');

  // let users = await User.find({});

  client.on('connection', (socket) => {
    console.log('Connected to client');

    const sendAllUsers = async () => {
      users = await User.find({});
      users = await Promise.all(
        users.map(async (_user) => {
          const chats = await Chat.find({
            participants: { $in: [ObjectId(_user._id)] }
          });
          return {
            ..._user._doc,
            conversations: chats
          };
        })
      );
      console.log(users.length);
      client.emit('users', users);
    };

    sendAllUsers();

    socket.on('message', async (messageData) => {
      console.log(ObjectId(messageData.from));
      const foundChat = await Chat.findOne({
        $and: [
          {
            participants: { $in: [ObjectId(messageData.from)] }
          },
          {
            participants: { $in: [ObjectId(messageData.to)] }
          }
        ]
      });

      if (!foundChat) {
        const chat = new Chat({
          messages: [
            {
              sender: messageData.from,
              message: messageData.message,
              meta: {
                delivered: false,
                read: false
              }
            }
          ],
          participants: [messageData.from, messageData.to]
        });

        chat.save().then(
          (_res) => {
            console.log('Chat Saved');
            sendAllUsers();
          },
          (_err) => console.error(_err)
        );
      } else {
        foundChat.messages.push({
          message: messageData.message,
          sender: messageData.from,
          meta: {
            delivered: false,
            read: false
          }
        });

        const updatedChat = new Chat(foundChat);
        try {
          await Chat.updateOne({ _id: ObjectId(foundChat._id) }, updatedChat);
          sendAllUsers();
        } catch (error) {
          console.log(error);
        }
      }
    });

    socket.on('new-user', async (userData) => {
      await User.findOneAndUpdate(
        {
          email: userData.email
        },
        {
          $set: {
            displayName: userData.displayName
          }
        },
        {
          upsert: true
        }
      );

      const updatedUser = await User.findOne({ email: userData.email });

      console.log(updatedUser);

      userIds[socket.id] = updatedUser._id;
      socket.emit('login_success');
      sendAllUsers();
    });
  });
});
