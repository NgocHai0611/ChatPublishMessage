const socketIo = require("socket.io");

let io;

function initSocket(server) {
  io = socketIo(server, {
    cors: { origin: "*" },
    connectionStateRecovery: {},
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Đăng ký room riêng theo userID
    socket.on("register", (userID) => {
      socket.join(userID);
      console.log(`User ${userID} joined their personal room`);
    });

    // Ngắt kết nối
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
}

function getSocketIo() {
  if (!io) {
    throw new Error("Socket.io chưa được khởi tạo!");
  }
  return io;
}

module.exports = { initSocket, getSocketIo };
