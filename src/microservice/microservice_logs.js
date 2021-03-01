"use strict";

const cluster = require("cluster");
const Server = require("../distributes/server");

class Logs extends Server {
  constructor() {
    super("logs", process.argv[2] ? +process.argv[2] : 9040, ["POST.logs"]);
  }

  onRead(socket, data) {
    const sz = `${new Date().toLocaleString()}\t${socket.remoteAddress}\t${socket.remotePort}\t${JSON.stringify(data)}\n`;
    console.log(sz);
  }
} 

if(cluster.isMaster) {
  cluster.fork()
  cluster.on("exit", (worker) => {
    console.log(`worker ${worker.process.pid} died`);
    cluster.fork()
  });
} else {
  new Logs();
}