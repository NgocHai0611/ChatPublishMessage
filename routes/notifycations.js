var express = require("express");
var router = express.Router();
const { getDB } = require("../config/db"); // Import hàm getDB từ db.js
const { PrismaClient } = require("@prisma/client");
const { getSocketIo } = require("../socket");
const { ObjectId } = require("mongodb");

const prisma = new PrismaClient();

// Id này ở đây là id receiver
router.get("/:id", async function (req, res) {
  const receive_id = req.params.id;

  const notify = await prisma.Notifycations.findMany({
    where: { receiver: receive_id },
  });

  res.status(200).send(notify);
});

module.exports = router;
