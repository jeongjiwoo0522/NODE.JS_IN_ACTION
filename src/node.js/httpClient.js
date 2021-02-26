const http = require("http");

const options = {
  port: 8000,
  host: "127.0.0.1",
  path: "/",
}

const req = http.request(options, (res) => {
  let data = "";
  res.on("data", (chuck) => {
    data += chuck;
  });
  res.on("end", () => {
    console.log(data);
  });
});

req.end();