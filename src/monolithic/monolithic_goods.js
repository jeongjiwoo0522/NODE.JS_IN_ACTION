const mysql = require("mysql");
const conn = require("../config");

exports.onRequest = (res, method, pathname, params, cb) => {
  switch (method) {
    case "POST":
      return register(method, pathname, params, (response) => {
        process.nextTick(cb, res, response);
      });
    case "GET":
      return inquiry(method, pathname, params, (response) => {
        process.nextTick(cb, res, response);
      });
    case "DELETE":
      return unregister(method, pathname, params, (response) => {
        process.nextTick(cb, res, response);
      });
    default:
      return process.nextTick(cb, res, null);
  }
}

function register(method, pathname, params, cb) {
  let response = {
    errorcode: 0,
    errormessage: "success",
  };
  if(params.name == null || params.category == null || params.price == null || params.description == null) {
    response.errorcode = 1;
    response.errormessage = "Invalid Parameters";
    cb(response);
  } else {
    const connection = mysql.createConnection(conn);
    connection.connect();
    connection.query("INSERT INTO goods(name, category, price, description) VALUES (?, ?, ?, ?)", [
      params.name, params.category, params.price, params.description
    ], (error, result, fields) => {
      if(error) {
        response.errorcode = 1;
        response.errormessage = "error";
      }
      cb(response);
    });
    connection.end();
  }
}