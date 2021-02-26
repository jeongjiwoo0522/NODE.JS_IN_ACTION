const net = require("net");

const options = {
  port: 9000,
  host: "127.0.0.1",
};

const clinet = net.connect(options, () => {
  console.log("connected");
});

clinet.on("data", (data) => {
  console.log(data.toString());
});

clinet.on("end", () => {
  console.log("disconnected");
}); 