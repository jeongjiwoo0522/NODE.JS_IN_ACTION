const TcpServer = require("./server");

const map = {};

class Distributor extends TcpServer {
  constructor() {
    super("distributor", 9000, ["POST/distributor", "GET/distributor"]);
  }
}

new Distributor();