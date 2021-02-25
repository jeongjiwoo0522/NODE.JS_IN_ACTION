const http = require("http");
const url = require("url");
const qs = require("querystring");

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
}).listen(8000);

function onRequest(res, method, pathname, params) {
  console.log(method, pathname, params);
  res.end("response");
}