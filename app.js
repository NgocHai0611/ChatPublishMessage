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

const { client, subscriber } = require("./config/redisConfig");

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

subscriber.subscribe("cskh_events", (message) => {
  console.log("📩 Nhận message từ channel:", message);
});

subscriber.subscribe("cskh_events_respone", (message) => {
  console.log("📩 Nhận message từ channel cskh_event_respone:", message);
});

app.get("/pub", async (req, res) => {
  const payload = {
    eventType: "CUSTOMER_MESSAGE",
    externalSessionId: "SESSION_001",
    channel: "CSKH_B2C",
    customerInfo: {
      customerCode: "KH001",
      name: "Nguyen Van A",
      phone: "0123456789",
      email: "a@gmail.com",
    },
    chatContent: {
      messageType: "Text",
      content: "Xin chào, tôi cần hỗ trợ.",
      sentAt: "2025-01-01T10:20:30Z",
    },
  };

  await client.publish("CSKH_Event", JSON.stringify(payload));

  res.send("Published");
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
