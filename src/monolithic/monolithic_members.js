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
    key: params.key,
    errorcode: 0,
    errormessage: "success",
  };
  if(params.username == null || params.password == null) {
    response.errorcode = 1;
    response.errormessage = "Invalid Parameter";
    cb(response);
  } else {
    const conncetion = mysql.createConnection(conn);
    conncetion.connect();
    conncetion.query(`INSERT INTO members (username, password) 
    values (${params.username}, password(${params.password}));`, (error, results, fields) => {
      if(error) {
        response.errorcode = 1;
        response.errormessage = error;
      }
      cb(response);
    });
    conncetion.end();
  }
}