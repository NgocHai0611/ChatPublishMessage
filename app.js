var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const { PrismaClient } = require("@prisma/client");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var chatRouter = require("./routes/chat");
var messagesRouter = require("./routes/message");
var notifyRouter = require("./routes/notifycations");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

const { connectDB } = require("./config/db");

var app = express();
require("dotenv").config();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const server = http.createServer(app);

// CORS middleware
app.use(cors());

// connectDB();

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/chat", chatRouter);
app.use("/messages", messagesRouter);
app.use("/notify", notifyRouter);

// Route tạo token

app.post("/get-token", (req, res) => {
  try {
    const payload = {
      apikey: process.env.VIDEOSDK_API_KEY,
      permissions: ["allow_join", "allow_mod"], // Phải có quyền này
    };

    const token = jwt.sign(payload, process.env.VIDEOSDK_SECRET_KEY, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (error) {
    console.error("❌ Lỗi tạo token:", error);
    res.status(500).json({ error: "Lỗi server khi tạo token" });
  }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
