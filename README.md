# 💬 Chat App

A modern real-time chat application built with **Node.js**, **Express**, **Socket.io**, and **Vanilla JavaScript**.

No registration required. Join instantly, chat in multiple rooms, send private messages, react to messages, and enjoy a clean light/dark mode interface.

---

## ✨ Features

### Real-Time Communication
- ⚡ Instant messaging with Socket.io
- 👥 Live online user count
- ⌨️ Typing indicators
- 🔔 Sound notifications for new messages

### Chat Rooms
- General
- Random
- Gaming
- Music
- Coding

### Messaging Features
- 📜 Message history (last 50 messages saved per room)
- 📌 Pin important messages
- 🔍 Real-time message search
- 😊 Emoji picker with 64 emojis
- ❤️ Emoji reactions
- 📷 Image sharing via URL
- ✔️ Read receipts

### Private Messaging
- 💬 Direct messages between users
- 📥 Dedicated DM panel
- 🔒 Private conversations

### User Experience
- 🎨 Automatic username colors
- 🌙 Light / Dark mode toggle
- 🚀 No account required
- 📱 Responsive design

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|----------|
| Node.js | Server runtime |
| Express | HTTP server |
| Socket.io | Real-time communication |
| HTML | Frontend structure |
| CSS | Styling and themes |
| JavaScript | Client-side functionality |

---

## 📂 Project Structure

```text
chat-app/
├── public/
│   ├── index.html      # Main chat interface
│   ├── style.css       # Styling and themes
│   └── client.js       # Frontend logic
│
├── server.js           # Express + Socket.io server
├── package.json        # Dependencies and scripts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- npm

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/chat-app.git
cd chat-app
```

#### 2. Install dependencies

```bash
npm install
```

#### 3. Start the server

```bash
node server.js
```

#### 4. Open the application

Visit:

```text
http://localhost:3000
```

and start chatting!

---

## 📖 Usage

### Joining a Chat

1. Open the application
2. Enter a nickname
3. Click **Join Chat**
4. Start chatting in the General room

### Switching Rooms

- Select any room from the sidebar
- Message history loads automatically

### Sending Private Messages

1. Click a username
2. Open the DM panel
3. Send your message privately

### Reacting to Messages

1. Hover over a message
2. Click **React**
3. Choose an emoji

### Pinning Messages

1. Hover over a message
2. Click **Pin**
3. The message appears in the pinned section

### Searching Messages

Use the search box to instantly find and highlight matching messages.

### Sharing Images

1. Click the image button
2. Paste an image URL
3. Send it to the chat

### Dark Mode

Toggle between Light and Dark themes using the theme switch button.

---

## 🎨 Username Color Palette

| Color | Hex Code |
|---------|---------|
| Red | #e94560 |
| Green | #4ade80 |
| Blue | #60a5fa |
| Amber | #f59e0b |
| Purple | #a78bfa |
| Teal | #34d399 |
| Pink | #f472b6 |
| Sky | #38bdf8 |

---

## 📡 Socket.io Events

### Client → Server

| Event | Description |
|---------|------------|
| set nickname | Set user's display name |
| join room | Join a room |
| chat message | Send a message |
| typing | User started typing |
| stop typing | User stopped typing |
| private message | Send a direct message |
| pin message | Pin a message |
| unpin message | Remove pinned message |
| react | Add a reaction |
| read receipt | Mark message as read |

### Server → Client

| Event | Description |
|---------|------------|
| chat message | Receive new message |
| message history | Load room history |
| user joined | User joined notification |
| user left | User left notification |
| typing | Typing indicator |
| stop typing | Stop typing indicator |
| private message | Receive DM |
| private message sent | DM confirmation |
| pinned message | Pinned message updated |
| reaction updated | Reactions updated |
| read receipt | Message read notification |

---

## 🚀 Deployment

### Railway

1. Push your project to GitHub
2. Create an account on Railway
3. Create a new project
4. Connect your GitHub repository
5. Deploy automatically

Your chat app will be live with a public URL.

---

## 🛠️ Troubleshooting

| Problem | Solution |
|-----------|------------|
| Port 3000 already in use | Run `lsof -i :3000` and kill the process |
| Messages not appearing | Check browser console |
| DM not working | Ensure both users are connected |
| Sound not playing | Click somewhere on the page first |

---

## 🔮 Future Improvements

- User authentication
- Persistent database storage
- File uploads
- Voice messages
- Message editing
- Message deletion
- Push notifications
- Mobile app version

---

## 📄 License

This project is licensed under the MIT License.

---

### 👨‍💻 Author

**Keonho Wang**

Software Engineering Student passionate about building practical tools that improve productivity and user experience.

---
