const { createServer } = require("http");
const { Server } = require("socket.io");
const { v4 } = require("uuid");

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});

let scores = [];
let formData = [];

setInterval(() => {
  io.emit("scores", scores);
  io.emit("formData", formData);
}, 5000);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.emit("message", "hello");

  socket.on("score", (score) => {
    scores.push({ ...score, id: v4() });

    io.emit("scores", scores);
  });

  socket.on("formData", (data) => {
    formData.push({ ...data, id: socket.id });

    io.emit("formData", formData);
  });

  socket.on("editData", (data) => {
    formData = formData.map((user) => (user.id === data.id ? data : user));

    io.emit("formData", formData);
  });

  socket.on("deleteData", (data) => {
    formData = formData.filter((user) => user.id != data.id);

    io.emit("formData", formData);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

httpServer.listen(8080, () => {
  console.log("server is connected");
});
