"use strict";

const cluster = require("cluster");
const business = require("../monolithic/monolithic_purchases");
const Server = require("../distributes/server");

class Purchases extends Server {
  constructor() {
    super("purchases", process.argv[2] ? +process.argv[2] : 9030, ["POST/purchases", "GET/purchases"]);
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
  cluster.fork(); // failover & fault tolerant

  cluster.on("exit", (worker) => {
    console.log(`worker ${worker.process.pid} died`);
    cluster.fork();
  }); 
} else {
  new Purchases(); 
}