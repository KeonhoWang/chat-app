const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

const users = {};
const userColors = {};
const roomMessages = {};
const pinnedMessages = {};
const reactions = {};

const COLORS = [
  "#e94560",
  "#4ade80",
  "#60a5fa",
  "#f59e0b",
  "#a78bfa",
  "#34d399",
  "#f472b6",
  "#38bdf8",
];

io.on("connection", (socket) => {
  console.log("Someone connected!");

  socket.on("set nickname", (nickname) => {
    users[socket.id] = nickname;
    if (!userColors[nickname]) {
      userColors[nickname] =
        COLORS[Object.keys(userColors).length % COLORS.length];
    }
    io.emit("user joined", {
      nickname,
      color: userColors[nickname],
      count: Object.keys(users).length,
    });
    console.log(`${nickname} joined!`);
  });

  socket.on("chat message", ({ room, message, image }) => {
    const nickname = users[socket.id] || "Anonymous";
    const msg = {
      id: Date.now().toString(),
      nickname,
      color: userColors[nickname] || "#e94560",
      message,
      image: image || null,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      reactions: {},
    };
    if (!roomMessages[room]) roomMessages[room] = [];
    roomMessages[room].push(msg);
    if (roomMessages[room].length > 50) roomMessages[room].shift();
    io.to(room).emit("chat message", msg);
  });

  socket.on("join room", (room) => {
    socket.rooms.forEach((r) => {
      if (r !== socket.id) socket.leave(r);
    });
    socket.join(room);
    socket.emit("room joined", room);
    if (roomMessages[room] && roomMessages[room].length > 0) {
      socket.emit("message history", roomMessages[room]);
    }
    if (pinnedMessages[room]) {
      socket.emit("pinned message", pinnedMessages[room]);
    }
  });

  socket.on("typing", (room) => {
    const nickname = users[socket.id];
    socket.to(room).emit("typing", nickname);
  });

  socket.on("stop typing", (room) => {
    socket.to(room).emit("stop typing");
  });

  socket.on("pin message", ({ room, msg }) => {
    pinnedMessages[room] = msg;
    io.to(room).emit("pinned message", msg);
  });

  socket.on("unpin message", (room) => {
    delete pinnedMessages[room];
    io.to(room).emit("pinned message", null);
  });

  socket.on("react", ({ room, msgId, emoji }) => {
    const msg = roomMessages[room]?.find((m) => m.id === msgId);
    if (!msg) return;
    if (!msg.reactions[emoji]) msg.reactions[emoji] = 0;
    msg.reactions[emoji]++;
    io.to(room).emit("reaction updated", { msgId, reactions: msg.reactions });
  });

  socket.on("private message", ({ to, message }) => {
    const fromNickname = users[socket.id];
    const toSocketId = Object.keys(users).find((id) => users[id] === to);
    const msg = {
      from: fromNickname,
      to,
      message,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    if (toSocketId) {
      socket.to(toSocketId).emit("private message", msg);
      socket.emit("private message sent", msg);
    } else {
      socket.emit("dm error", `${to} is not online`);
    }
  });

  socket.on("read receipt", ({ room, reader }) => {
    socket.to(room).emit("read receipt", reader);
  });

  socket.on("disconnect", () => {
    const nickname = users[socket.id];
    if (nickname) {
      delete users[socket.id];
      io.emit("user left", { nickname, count: Object.keys(users).length });
      console.log(`${nickname} left!`);
    }
  });
});

server.listen(3000, () => {
  console.log("Chat server running on http://localhost:3000");
});
