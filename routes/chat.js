var express = require("express");
var router = express.Router();
const { getDB } = require("../config/db");
const mongoose = require("mongoose");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { generateID } = require("../config/generateID");
const { getSocketIo } = require("../socket");

// Endpoint thực hiện aggregation trên collection "chats"
router.get("/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const chatData = await prisma.$runCommandRaw({
      aggregate: "Chat",
      pipeline: [
        {
          $lookup: {
            from: "Messagess", // Liên kết với collection "message"
            localField: "_id",
            foreignField: "chatID",
            as: "messages",
          },
        },
        {
          $match: {
            users: userId, // Lọc các cuộc trò chuyện có userId
          },
        },
        {
          $lookup: {
            from: "Users", // Liên kết với collection "users"
            localField: "users",
            foreignField: "_id",
            as: "userDetails",
          },
        },
      ],
      cursor: {},
    });

    if (!chatData || chatData.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No chats found!" });
    }

    res.status(200).json(chatData.cursor.firstBatch);
  } catch (error) {
    console.error("Error fetching chat data:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.post("/createGroup", async (req, res) => {
  const { chatName, users, groupAdmin } = req.body;
  const newIdGroup = generateID();
  try {
    const resultCreateGroup = await prisma.chat.create({
      data: {
        id: newIdGroup,
        chatName,
        users,
        latestMessage: "",
        groupAdmin,
        isGroupChat: true,
        createdAt: new Date().toISOString(),
        lastActivityTime: new Date().toISOString(),
        lastUserSender: "",
      },
    });

    res.status(200).send(resultCreateGroup);
  } catch (error) {
    console.error("Error create group:", error);
    res.status(500).json({ error: "Error create group" });
  }
});

router.post("/addUserToGroup", async (req, res) => {
  const { chatID, users } = req.body;

  try {
    // Thêm user mới vào mảng users
    const resultUpdatedGroup = await prisma.chat.update({
      where: { id: chatID },
      data: {
        users: {
          push: users,
        },
        lastActivityTime: new Date().toISOString(),
      },
    });

    res.status(200).json({ message: "Added user to group successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error add users to group" });
  }
});

router.post("/getUsersNotInGroup", async (req, res) => {
  const { chatRoom } = req.body;

  //

  try {
    // Lấy danh sách tất cả users
    const allUsers = await prisma.users.findMany();

    // Lấy danh sách users hiện có trong group
    const group = await prisma.chat.findUnique({
      where: { id: chatRoom },
      select: {
        users: true,
      },
    });

    if (!group) {
      return res.status(200).json(allUsers);
    }

    // Lọc ra những user không có trong group
    const usersNotInGroup = allUsers.filter(
      (user) => !group.users.includes(user.id)
    );

    res.status(200).json(usersNotInGroup);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách user:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

module.exports = router;
