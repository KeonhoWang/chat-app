const socket = io();

let nickname = "";
let currentRoom = "general";
let typingTimeout = null;
let dmTarget = "";
let isLight = false;

const nicknameScreen = document.getElementById("nickname-screen");
const chatScreen = document.getElementById("chat-screen");
const nicknameInput = document.getElementById("nickname-input");
const joinBtn = document.getElementById("join-btn");
const messagesEl = document.getElementById("messages");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const onlineCount = document.getElementById("online-count");
const typingIndicator = document.getElementById("typing-indicator");
const userNickname = document.getElementById("user-nickname");
const userAvatar = document.getElementById("user-avatar");
const currentRoomName = document.getElementById("current-room-name");
const seenBar = document.getElementById("seen-bar");
const pinnedBar = document.getElementById("pinned-bar");
const pinnedText = document.getElementById("pinned-text");
const unpinBtn = document.getElementById("unpin-btn");
const searchInput = document.getElementById("search-input");
const themeBtn = document.getElementById("theme-btn");
const rooms = document.querySelectorAll(".room");
const emojiBtn = document.getElementById("emoji-btn");
const emojiPicker = document.getElementById("emoji-picker");
const emojiGrid = document.getElementById("emoji-grid");
const imageBtn = document.getElementById("image-btn");

// Emojis
const EMOJIS = [
  "😀",
  "😂",
  "😍",
  "🥰",
  "😎",
  "🤩",
  "😭",
  "😅",
  "🤔",
  "😏",
  "😒",
  "🙄",
  "😬",
  "🤯",
  "🥳",
  "😴",
  "👍",
  "👎",
  "👏",
  "🙌",
  "🤝",
  "💪",
  "🤞",
  "✌️",
  "❤️",
  "🧡",
  "💛",
  "💚",
  "💙",
  "💜",
  "🖤",
  "🤍",
  "🔥",
  "⭐",
  "✨",
  "🎉",
  "🎊",
  "🎈",
  "🎮",
  "🎵",
  "😺",
  "🐶",
  "🦊",
  "🐼",
  "🐨",
  "🦁",
  "🐸",
  "🦄",
  "🍕",
  "🍔",
  "🍟",
  "🌮",
  "🍜",
  "🍣",
  "🍦",
  "🎂",
  "⚽",
  "🏀",
  "🎯",
  "🏆",
  "🎲",
  "🃏",
  "🎸",
  "🚀",
];

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

EMOJIS.forEach((emoji) => {
  const span = document.createElement("span");
  span.classList.add("emoji-item");
  span.textContent = emoji;
  span.addEventListener("click", () => {
    messageInput.value += emoji;
    messageInput.focus();
    emojiPicker.classList.add("hidden");
  });
  emojiGrid.appendChild(span);
});

emojiBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  emojiPicker.classList.toggle("hidden");
});

document.addEventListener("click", () => {
  emojiPicker.classList.add("hidden");
});

// Theme toggle
themeBtn.addEventListener("click", () => {
  isLight = !isLight;
  document.body.classList.toggle("light", isLight);
  themeBtn.textContent = isLight ? "🌑" : "🌙";
});

// Image URL
imageBtn.addEventListener("click", () => {
  const url = prompt("Paste an image URL:");
  if (!url) return;
  if (!url.startsWith("http")) {
    alert("Please paste a valid image URL starting with http");
    return;
  }
  socket.emit("chat message", { room: currentRoom, message: "", image: url });
});

// Search messages
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase().trim();
  const allMessages = messagesEl.querySelectorAll(".message");
  allMessages.forEach((msg) => {
    const bubble = msg.querySelector(".message-bubble");
    if (!bubble) {
      msg.classList.remove("highlight");
      return;
    }
    const text = bubble.textContent.toLowerCase();
    if (query && text.includes(query)) {
      msg.classList.add("highlight");
    } else {
      msg.classList.remove("highlight");
    }
  });
});

// Pin message
unpinBtn.addEventListener("click", () => {
  socket.emit("unpin message", currentRoom);
});

// Sound
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playNotification() {
  try {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
    oscillator.frequency.setValueAtTime(660, audioCtx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioCtx.currentTime + 0.3,
    );
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.3);
  } catch (e) {}
}

// Join chat
joinBtn.addEventListener("click", joinChat);
nicknameInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") joinChat();
});

function joinChat() {
  const name = nicknameInput.value.trim();
  if (!name) return;
  nickname = name;
  socket.emit("set nickname", nickname);
  nicknameScreen.classList.add("hidden");
  chatScreen.classList.remove("hidden");
  userNickname.textContent = nickname;
  userAvatar.textContent = nickname[0].toUpperCase();
  messagesEl.innerHTML = "";
  socket.emit("join room", currentRoom);
  messageInput.focus();
}

// Switch rooms
rooms.forEach((room) => {
  room.addEventListener("click", () => {
    const roomName = room.dataset.room;
    if (roomName === currentRoom) return;
    currentRoom = roomName;
    rooms.forEach((r) => r.classList.remove("active"));
    room.classList.add("active");
    currentRoomName.textContent = room.textContent;
    messagesEl.innerHTML = "";
    seenBar.textContent = "";
    pinnedBar.classList.add("hidden");
    socket.emit("join room", roomName);
  });
});

// Send message
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) return;
  socket.emit("chat message", { room: currentRoom, message });
  messageInput.value = "";
  socket.emit("stop typing", currentRoom);
  clearTimeout(typingTimeout);
}

// Typing
messageInput.addEventListener("input", () => {
  socket.emit("typing", currentRoom);
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit("stop typing", currentRoom);
  }, 3000);
});

// Add message
function addMessage(data, isOwn) {
  const div = document.createElement("div");
  div.classList.add("message", isOwn ? "mine" : "other");
  div.dataset.id = data.id;

  const nameHtml = isOwn
    ? `<span style="color:${data.color || "#e94560"}">You</span>`
    : `<span class="clickable-name" style="color:${data.color || "#aaa"}">${data.nickname}</span>`;

  const textHtml = data.message
    ? `<div class="message-bubble">${escapeHtml(data.message)}</div>`
    : "";

  const imageHtml = data.image
    ? `<img src="${data.image}" class="message-image" onerror="this.outerHTML='<div style=color:#e94560;font-size:0.8rem>Image failed to load</div>'" onclick="window.open(this.src)" />`
    : "";

  div.innerHTML = `
    <div class="message-meta">
      ${nameHtml} · ${data.time}
    </div>
    ${textHtml}
    ${imageHtml}
    <div class="reactions-bar"></div>
    <div class="message-actions">
      <button class="action-btn react-btn">😊 React</button>
      ${!isOwn ? "" : ""}
      <button class="action-btn pin-btn">📌 Pin</button>
    </div>
  `;

  // Update reactions if any
  if (data.reactions) updateReactionsBar(div, data.reactions, data.id);

  // Clickable name
  const nameEl = div.querySelector(".clickable-name");
  if (nameEl) nameEl.addEventListener("click", () => openDM(data.nickname));

  // React button
  div.querySelector(".react-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    showReactionPicker(div, data.id);
  });

  // Pin button
  div.querySelector(".pin-btn").addEventListener("click", () => {
    socket.emit("pin message", { room: currentRoom, msg: data });
  });

  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  if (!isOwn)
    socket.emit("read receipt", { room: currentRoom, reader: nickname });
}

// Reaction picker
function showReactionPicker(msgDiv, msgId) {
  // Remove existing picker
  document.querySelectorAll(".reaction-picker").forEach((p) => p.remove());

  const picker = document.createElement("div");
  picker.classList.add("reaction-picker");
  picker.style.cssText = `
    position: absolute;
    background: #16213e;
    border: 1px solid #0f3460;
    border-radius: 30px;
    padding: 6px 10px;
    display: flex;
    gap: 8px;
    z-index: 500;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
  `;

  REACTION_EMOJIS.forEach((emoji) => {
    const btn = document.createElement("span");
    btn.textContent = emoji;
    btn.style.cssText = "cursor:pointer;font-size:1.3rem";
    btn.addEventListener("click", () => {
      socket.emit("react", { room: currentRoom, msgId, emoji });
      picker.remove();
    });
    picker.appendChild(btn);
  });

  msgDiv.appendChild(picker);
  setTimeout(() => {
    document.addEventListener("click", () => picker.remove(), { once: true });
  }, 100);
}

// Update reactions bar
function updateReactionsBar(msgDiv, reactions, msgId) {
  const bar = msgDiv.querySelector(".reactions-bar");
  if (!bar) return;
  bar.innerHTML = "";
  Object.entries(reactions).forEach(([emoji, count]) => {
    if (count <= 0) return;
    const chip = document.createElement("span");
    chip.classList.add("reaction-chip");
    chip.textContent = `${emoji} ${count}`;
    chip.addEventListener("click", () => {
      socket.emit("react", { room: currentRoom, msgId, emoji });
    });
    bar.appendChild(chip);
  });
}

function addSystemMessage(text) {
  const div = document.createElement("div");
  div.classList.add("system-message");
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// DM Panel
let dmPanel = null;

function buildDMPanel() {
  if (dmPanel) dmPanel.remove();
  dmPanel = document.createElement("div");
  dmPanel.id = "dm-panel";
  dmPanel.innerHTML = `
    <div id="dm-panel-header">
      <span id="dm-panel-title">DM to ${dmTarget}</span>
      <button id="dm-panel-close">X</button>
    </div>
    <div id="dm-panel-messages"></div>
    <div id="dm-panel-input-area">
      <input id="dm-panel-input" type="text" placeholder="Type a private message..." maxlength="500" />
      <button id="dm-panel-send">Send</button>
    </div>
  `;
  document.body.appendChild(dmPanel);

  document.getElementById("dm-panel-close").addEventListener("click", () => {
    dmPanel.remove();
    dmPanel = null;
    dmTarget = "";
  });

  document.getElementById("dm-panel-send").addEventListener("click", sendDM);
  document
    .getElementById("dm-panel-input")
    .addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendDM();
    });

  setTimeout(() => {
    document.getElementById("dm-panel-input").focus();
  }, 100);
}

function openDM(target) {
  if (target === nickname) return;
  dmTarget = target;
  buildDMPanel();
}

function sendDM() {
  const input = document.getElementById("dm-panel-input");
  const message = input.value.trim();
  if (!message || !dmTarget) return;
  socket.emit("private message", { to: dmTarget, message });
  input.value = "";
}

function addDMMessage(text, isSent, from) {
  const container = document.getElementById("dm-panel-messages");
  if (!container) return;
  const div = document.createElement("div");
  div.classList.add("dm-msg", isSent ? "sent" : "received");
  div.innerHTML = `
    <div class="dm-meta">${isSent ? "You" : from}</div>
    <div class="dm-bubble">${escapeHtml(text)}</div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

// Socket events
socket.on("chat message", (data) => {
  const isOwn = data.nickname === nickname;
  addMessage(data, isOwn);
  if (!isOwn) playNotification();
});

socket.on("user joined", ({ nickname: name, count }) => {
  onlineCount.textContent = `${count} online`;
  if (name !== nickname) addSystemMessage(`${name} joined the chat`);
});

socket.on("user left", ({ nickname: name, count }) => {
  onlineCount.textContent = `${count} online`;
  addSystemMessage(`${name} left the chat`);
});

socket.on("room joined", (room) => {
  addSystemMessage(`Welcome to ${room}!`);
  messagesEl.scrollTop = messagesEl.scrollHeight;
});

socket.on("typing", (name) => {
  typingIndicator.textContent = `${name} is typing...`;
});

socket.on("stop typing", () => {
  typingIndicator.textContent = "";
});

socket.on("message history", (messages) => {
  messages.forEach((msg) => {
    const isOwn = msg.nickname === nickname;
    addMessage(msg, isOwn);
  });
  messagesEl.scrollTop = messagesEl.scrollHeight;
});

socket.on("private message", (data) => {
  playNotification();
  if (!dmPanel) {
    dmTarget = data.from;
    buildDMPanel();
  }
  addDMMessage(data.message, false, data.from);
  addSystemMessage(`New DM from ${data.from}!`);
});

socket.on("private message sent", (data) => {
  addDMMessage(data.message, true, data.to);
});

socket.on("dm error", (error) => {
  addSystemMessage(`DM failed: ${error}`);
});

socket.on("read receipt", (reader) => {
  seenBar.textContent = `Seen by ${reader}`;
  setTimeout(() => {
    seenBar.textContent = "";
  }, 5000);
});

socket.on("pinned message", (msg) => {
  if (!msg) {
    pinnedBar.classList.add("hidden");
    return;
  }
  pinnedText.textContent = `${msg.nickname}: ${msg.message || "Image"}`;
  pinnedBar.classList.remove("hidden");
});

socket.on("reaction updated", ({ msgId, reactions }) => {
  const msgDiv = messagesEl.querySelector(`[data-id="${msgId}"]`);
  if (msgDiv) updateReactionsBar(msgDiv, reactions, msgId);
});
