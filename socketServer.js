const { Server } = require("socket.io");

// Maintain a list of rooms
const rooms = [];

const initializeSocketServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected");

    // Handle creating a chat room based on two ids
    socket.on("createRoom", (id1, id2) => {
      const room = [id1, id2].join("-"); // Create a room identifier
      rooms.push({ room, users: [id1, id2] });
      socket.join(room);
      console.log(`Room ${room} created with users ${id1} and ${id2}`);
    });

    // Handle joining a chat room based on two ids
    socket.on("joinRoom", (id1, id2) => {
      const room = rooms.find(
        (r) => r.users.includes(id1) && r.users.includes(id2)
      );
      if (room) {
        socket.join(room.room);
        console.log(`User ${id1} joined room ${room.room} with user ${id2}`);
      } else {
        console.log(
          `Room not found or user IDs do not match for room creation`
        );
      }
    });

    // Handle sending messages to a specific receiver
    socket.on("sendMessage", (data) => {
      const { senderId, receiverId, roomId, message } = data;

      socket.broadcast.to(roomId).emit("receiveMessage", {
        senderId,
        message,
      });
    });

    socket.on("leaveRoom", () => {
      console.log("Client disconnected");
    });
  });
};

module.exports = initializeSocketServer;
