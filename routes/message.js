var express = require("express");
var router = express.Router();
const { getDB } = require("../config/db"); // Import hàm getDB từ db.js
const { PrismaClient } = require("@prisma/client");
const { getSocketIo } = require("../socket");
const { v4: uuidv4 } = require("uuid");

const prisma = new PrismaClient();

router.post("/sendMessage", async (req, res) => {
  try {
    const { senderID, chatID, content, readBy, timestamp } = req.body;

    const idNewMessage = `M${uuidv4()}`;

    const newMessage = await prisma.messagess.create({
      data: { id: idNewMessage, senderID, chatID, content, readBy, timestamp },
    });

    // Lấy thông tin room chat và danh sách user trong room
    const chatRoom = await prisma.chat.findUnique({
      where: { id: chatID },
    });

    // Cập nhật thông tin chat
    await prisma.chat.update({
      where: { id: chatID },
      data: {
        lastActivityTime: timestamp,
        latestMessage: content,
        lastUserSender: senderID,
      },
    });

    const io = getSocketIo();

    console.log(chatRoom);

    // Gửi tin nhắn đến tất cả user trong room qua userID
    chatRoom.users.forEach((user) => {
      if (user !== senderID) {
        io.to(user).emit("receive_message", {
          senderID,
          chatID,
          content,
          readBy,
          timestamp,
        });
      }

      // Nếu không phải người gửi, gửi thông báo mới
      if (user !== senderID) {
        io.to(user).emit("new_message_notification", {
          senderID,
          chatID,
          content,
        });
      }
    });

    res.status(200).json(newMessage);
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "Fail Save Message" });
  }
});

router.post("/seenMessages/:id", async (req, res) => {
  try {
    const idLastestMessage = req.params.id;
    const { idUserRead } = req.body;
    console.log(idLastestMessage, idUserRead);

    // await prisma.messagess.update({
    //   where: { id: idLastestMessage },
    //   data: {
    //     readBy: {
    //       push: idUserRead,
    //     },
    //   },
    // });

    const resultUpdatedMessage = await prisma.messagess.update({
      where: { id: idLastestMessage },
      data: {
        readBy: {
          push: idUserRead,
        },
      },
    });

    res.status(200).json({ newMessage: "Updated Successfully" });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
