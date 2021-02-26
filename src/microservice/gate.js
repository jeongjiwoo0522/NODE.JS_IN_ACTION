const http = require("http");
const url = require("url");
const qs = require("querystring");

const TcpClient = require("../distributes/client");

const mapClients = {};
const mapUrls = {};
const mapResponse = {};
const mapRR = {};
let index = 0;

const server = http.createServer((req, res) => {
  const method = req.method;
  const uri = url.parse(req.url, true);
  const pathname = uri.pathname;

  if(method === "POST" || method === "PUT") {
    let body = "";
    req.on("data", (data) => {
      body += data;
    });
    req.on("end", () => {
      let params;
      if(req.headers["content-type"] === "application/json") {
        params = JSON.parse(body);
      } else {
        params = qs.parse(body);
      }
      onRequest(res, method, pathname, params);
    });
  } else {
    onRequest(res, method, pathname, uri.query);
  }
}).listen(8000, () => {
  console.log("listen", server.address());

  const packet = {
    uri: "/distributes", 
    method: "POST",
    key: 0,
    params: {
      port: 8000,
      name: "gate",
      urls: [],
    },
  };
  let isConnectedDistributor = false;

  this.clientDistributor = new TcpClient("127.0.0.1", 9000, 
  (options) => {
    isConnectedDistributor = true;
    this.clientDistributor.write(packet);
  }, 
  (options, data) => {
    onDistribute(data);
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
});

function onRequest(res, method, pathname, params) {

}

function onDistribute(data) {
  for (let n in data.params) {
    const node = data.params[n];
    const key = `${node.host}:${node.port}`;
    if(mapclients[key] == null && node.name !== "gate") {
      const client = new TcpClient(node.host, node.port, onCreateClient, onReadClient, onEndClient, onErrorClinet);
      mapClients[key] = { client, info: node };
      for(let m in node.urls) {
        const prop = node.urls[m];
        if(mapUrls[prop] == null) {
          mapUrls[key] = [];
        }
        mapUrls[key].push(client);
      }
      client.connect();
    } 
  }
}

function onCreateClient(optoins) {
  console.log("onCreateClinet");
}

function onReadClient(options, packet) {

}

function onEndClient(options) {
  const key = `${options.host}:${options.port}`;
  console.log("onEndClient", mapClients[key]);
  for(let n in mapClients[key].info.urls) {
    const node = mapClients[key].info.urls[n];
    delete mapUrls[node];
  }
  delete mapClients[key];
}

function onErrorClinet(options) {
  console.log("onErrorClinet");
}