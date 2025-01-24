const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const user = require("../models/user");

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    // Handle events

    socket.on("joinChat", ({ firstname, userId, targetUserId }) => {
      const roomId = getSecretRoomId(userId, targetUserId); // sorting for making roomId same for 2 users
      socket.join(roomId);
    });

    socket.on(
      "sendMessage",
      async ({ firstname, userId, targetUserId, text }) => {
        try {
          const roomId = getSecretRoomId(userId, targetUserId);
          // TODO: Before Sending message check that targetUserId is my friend or not
          // Save message to the Database
          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [],
            });
          }

          chat.messages.push({
            senderId: userId,
            message: text,
          });

          await chat.save();
          io.to(roomId).emit("messageReceived", { firstname, text });
        } catch (error) {
          console.log("Error while saving message: " + error);
        }
      }
    );

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;
