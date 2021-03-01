"use strict";

const net = require("net");
const TcpClient = require("./client");

class TcpServer {
  constructor(name, port, urls) {
    this.logTcpClinet = null;
    this.context = { port, name, urls };
    this.merge = {};
    this.server = net.createServer((socket) => {
      this.onCreate(socket);
      socket.on("error", (exception) => {
        this.onClose(socket);
      });
      socket.on("close", () => {
        this.onClose(socket);
      });
      socket.on("data", (data) => {
        const key = `${socket.remoteAddress}:${socket.remotePort}`;
        const sz = this.merge[key] ? this.merge[key] + data.toString() : data.toString();
        const arr = sz.split("@");
        for(let n in arr) {
          if(sz.charAt(sz.length -1) !== "@" && n == arr.length - 1) {
            this.merge[key] = arr[n];
            break;
          } else if(arr[n] == "") {
            break;
          } else {
            this.writeLog(arr[n]);
            this.onRead(socket, JSON.parse(arr[n]));
          }
        }
      });
    });
    this.server.on("error", (err) => {
      console.error(err);
    });
    this.server.listen(port, () => {
      console.log("listen", this.server.address());
    });
  }
  onCreate(socket) {
    console.log("onCreate", socket.remoteAddress, socket.remotePort);
  }

  onClose(socket) {
    console.log("onClose", socket.remoteAddress, socket.remotePort);
  }

  connectToDistributor(host, port, onNoti) {
    const packet = {
      uri: "/distributes",
      method: "POST",
      key: 0,
      params: this.context,
    };
    let isConnectedDistributor = false;

    this.clientDistributor = new TcpClient(host, port, 
    (option) => {
      isConnectedDistributor = true;
      this.clientDistributor.write(packet);
    }, 
    (options, data) => { 
      if(this.logTcpClinet == null && this.context.name !== "logs") {
        for(let n in data.params) {
          const ms = data.params[n];
          if(ms.name == "logs") {
            this.connectToLog(ms.host, ms.port);
            break;
          }
        }
      }
      onNoti(data); 
    }, 
    (options) => {
      isConnectedDistributor = false;
    },
    (options) => {
      isConnectedDistributor = false;
    });
    setInterval(() => {
      if(!isConnectedDistributor) {
        this.clientDistributor.connect();
      }
    }, 3000);
  }

  connectToLog(host, port) {
    this.logTcpClinet = new TcpClient(host, port,
      (options) => {}, (options) => { this.logTcpClinet = null }, (options) => { this.logTcpClinet = null });
    this.logTcpClinet.connect();
  }

  writeLog(log) {
    if(this.logTcpClinet) {
      const packet = {
        uri: "/logs",
        method: "POST",
        key: 0,
        params: log
      };
      this.logTcpClinet.write(packet);
    } else {
      console.log(log);
    }
  }
}


module.exports = TcpServer;