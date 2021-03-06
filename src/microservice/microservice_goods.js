"use strict";

const cluster = require("cluster");
const business = require("../monolithic/monolithic_goods");
const Server = require("../distributes/server");

class Goods extends Server {
  constructor() {
    super("goods", process.argv[2] ? +process.argv[2] : 9010, ["POST/goods", "GET/goods", "DELETE/goods"]);
    this.connectToDistributor("127.0.0.1", 9000, (data) => {
      console.log("Distributor Notification", data);
    });
  }

  onRead(socket, data) {
    console.log("onRead", socket.remoteAddress, socket.remotePort, data);
    business.onRequest(socket, data.method, data.uri, data.params, (s, packet) => {
      socket.write(JSON.stringify(packet) + "@");
    });
  }
}

if(cluster.isMaster) {
  cluster.fork();

  cluster.on("exit", (worker) => {
    console.log(`worker ${worker.process.pid} died`);
    cluster.fork(); // failover & fault tolerant
  });
} else {
  new Goods();
}