var express = require("express");
var router = express.Router();
const { getDB } = require("../config/db");
const mongoose = require("mongoose");

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

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

// router.get("/:id", function (req, res, next) {
//   const userId = req.params.id; // Lấy userId từ tham số route

//   const db = getDB(); // Lấy instance của database

//   db.collection("chats")
//     .aggregate([
//       {
//         $lookup: {
//           from: "message",
//           localField: "_id",
//           foreignField: "chatID",
//           as: "message",
//         },
//       },
//       {
//         $match: {
//           users: userId, // So sánh trực tiếp chuỗi userId
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "users",
//           foreignField: "_id",
//           as: "userDetails",
//         },
//       },
//     ])
//     .toArray()
//     .then((result) => {
//       if (result.length > 0) {
//         res.status(200).json(result); // Trả về kết quả aggregation
//       } else {
//         res.status(404).json({ success: false, message: "No chats found!" }); // Nếu không có chat nào
//       }
//     })
//     .catch((error) => {
//       console.error(error);
//       res.status(500).send("Server Error"); // Xử lý lỗi nếu có
//     });
// });

module.exports = router;
