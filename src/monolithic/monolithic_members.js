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

function inquiry(method, pathname, params, cb) {
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
    const connection = mysql.createConnection(conn);
    connection.connect();
    connection.query(`SELECT id FROM members WHERE 
    username = ${params.username} AND password = password(${params.password});`, (error, result, fields) => {
      if(error || result.length == 0) {
        response.errorcode = 1;
        response.errormessage = error ? error : "Invalid password";
      } else {
        response.userId = result[0].id;
      }
      cb(response);
    });
    connection.end();
  }
}

function unregister(method, pathname, params, cb) {
  let response = {
    key: params.key,
    errorcode: 0,
    errormessage: "success",
  };
  if(params.username == null) {
    response.errorcode = 1;
    response.errormessage = "Invalid Parameter";
    cb(response);
  } else {
    const connection = mysql.createConnection(conn);
    connection.connect();
    connection.query(`DELETE FROM members WHERE username = ${params.username};`, (error, results, fields) => {
      if(error) {
        response.errorcode = 1;
        response.errormessage = error;
      } 
      cb(response);
    });
    connection.end();
  }
}