const socket = require("socket.io");
const crypto = require('crypto');

const getSecretRoomId = (userId, targetUserId) => {
    return crypto.createHash("sha256").update([userId, targetUserId].sort().join("_")).digest("hex");
}

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    // Handle events

    socket.on('joinChat', ({firstname, userId, targetUserId}) => {
        const roomId =  getSecretRoomId(userId, targetUserId); // sorting for making roomId same for 2 users

        console.log(firstname + " joined room: " + roomId);

        socket.join(roomId);
    });

    socket.on('sendMessage', ({ firstname, userId, targetUserId, text }) => {
        const roomId =  getSecretRoomId(userId, targetUserId);

        console.log(firstname + " : " + text);

        io.to(roomId).emit('messageReceived', {firstname, text})
    });

    socket.on('disconnect', () => {

    });
  });
};

module.exports = initializeSocket;
