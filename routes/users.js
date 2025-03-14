var express = require("express");
var router = express.Router();
const { getDB } = require("../config/db"); // Import hàm getDB từ db.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/* GET users listing. */
router.get("/", async function (req, res, next) {
  try {
    const users = await prisma.Users.findMany();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Error fetching users");
  }
});

/* POST /login */
router.post("/login", async function (req, res) {
  const { email, password } = req.body; // Lấy email và password từ body

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required!" });
  }

  try {
    const user = await prisma.users.findFirst({
      where: { email },
    });

    if (user && user.password === password) {
      return res.status(200).json({
        success: true,
        data: [
          {
            id: user.id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            isAdmin: user.isAdmin,
          },
        ],
        message: "Login successful!",
      });
    }

    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password!" });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

router.get("/:id", function (req, res, next) {
  const userId = req.params.id; // Lấy ID từ URL và loại bỏ khoảng trắng
  console.log(userId);
  const db = getDB(); // Lấy instance của database

  db.collection("users")
    .findOne({ _id: userId }) // Tìm theo ID dạng string
    .then((user) => {
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      res.status(200).json(user);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ success: false, message: "Server error" });
    });
});

module.exports = router;
