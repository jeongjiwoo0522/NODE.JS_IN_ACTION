const mysql = require("mysql");
const conn = require("../config");

const redis = require("redis").createClient();

redis.on("error", (err) => {
  console.log("Redis Error", err);
});

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
  if(params.name == null || params.category == null || params.price == null || params.description == null) {
    response.errorcode = 1;
    response.errormessage = "Invalid Parameters";
    cb(response);
  } else {
    const connection = mysql.createConnection(conn);
    connection.connect();
    connection.query(`INSERT INTO goods(name, category, price, description) 
                      VALUES (?, ?, ?, ?); SELECT LAST_INSERT_ID as id`, [
      params.name, params.category, params.price, params.description
    ], (error, result, fields) => {
      if(error) {
        response.errorcode = 1;
        response.errormessage = "error";
      } else {
        const id = result[1][0].id;
        redis.set(id, JSON.stringify(params));
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
  const connection = mysql.createConnection(conn);
  connection.connect();
  connection.query("SELECT * FROM goods", (error, results, fields) => {
    if(error || results.length == 0) {
      response.errorcode = 1;
      response.errormessage = error ? error : "no data";
    } else {
      response.results = results;
    }
    cb(response);
  });
  connection.end();
}

function unregister(method, pathname, params, cb) {
  let response = {
    key: params.key,
    errorcode: 0,
    errormessage: "success",
  };
  if(params.id == null) {
    response.errorcode = 1;
    response.errormessage = "Invalid Parameter";
    cb(response);
  } else {
    const connection = mysql.createConnection(conn);
    connection.connect();
    connection.query("DELETE FROM goods WHERE id = ?", [
      params.id,
    ], (error, results, fields) => {
      if(error) {
        response.errorcode = 1;
        response.errormessage = "error";
      } else {
        redis.del(params.id);
      }
      cb(response);
    });
    connection.end();
  }
}