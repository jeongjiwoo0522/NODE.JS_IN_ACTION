const net = require("net");

const server = net.createServer((socket) => {
  socket.end("hello world");
});

server.on("error", (err) => {
  console.error(err);
});

server.listen(9000, () => {
  console.log("listen", server.address());
});