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

  if(params.userid == null || params.goodsid == null) {
    response.errorcode = 1;
    response.errormessage = "Invalid Parameter";
    cb(response);
  } else {
    const connection = mysql.createConnection(conn);
    connection.connect();
    connection.query("INSERT INTO purchases(userid, goodsid) VALUES (?, ?)", [
      params.userid, params.goodsid
    ], (error, results, fields) => {
      if(error) {
        response.errorcode = 1;
        response.errormessage = error;
      } 
      cb(response);
    });
    connection.end();
  }
}

function inquiry(method, pathname, params, cb) {
  let response = {
    key: params.key,
    errorcode: 0,
    errormessage: "success",
  };

  if(params.userid == null) {
    response.errorcode = 1;
    response.errormessage = "Invalid Parameter";
    cb(response);
  } else {
    const connection = mysql.createConnection(conn);
    connection.connect();
    connection.query("SELECT id, goodsid, date FROM purchases WHERE userid = ?", [
      params.userid
    ], (error, results, fields) => {
      if(error) {
        response.errorcode = 1;
        response.errormessage = error;
      } else {
        response.results = results;
      }
      cb(response);
    });
    connection.end();
  }
}