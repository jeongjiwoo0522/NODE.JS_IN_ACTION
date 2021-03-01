"use strict";

const fs = require("fs");
const cluster = require("cluster");
const Server = require("../distributes/server");

class Logs extends Server {
  constructor() {
    super("logs", process.argv[2] ? +process.argv[2] : 9040, ["POST/logs"]);

    this.writestream = fs.createWriteStream("./comon.log", { flags: "a" });

    this.connectToDistributor("127.0.0.1", 9000, (data) => {
      console.log("Distributor Notification", data);
    });
  }

  onRead(socket, data) {
    const sz = `${new Date().toLocaleString()} ${socket.remoteAddress} ${socket.remotePort}   ${JSON.stringify(data)}\n`;
    console.log(sz);
    this.writestream.write(sz);
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