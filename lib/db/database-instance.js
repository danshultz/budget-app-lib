var denodeify = require('../util/denodeify');
var sqlite3 = require('sqlite3').verbose();
var dbInstances = {};

class DatabaseInstance {
  constructor (db) {
    this.db = db;
    ['all', 'get', 'prepare'].forEach((n) => {
      this[n] = this._denodify(db, n)
    });
  }

  run (statement, params) {
    let args = Array.prototype.slice.call(arguments);
    let db = this.db;

    return new Promise((resolve, reject) => {
      args.push(function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
      db.run.apply(db, args);
    });
  }

  _denodify (db, func) {
    let wrapped = denodeify(db[func]);
    return function () {
      return wrapped.apply(db, arguments);
    }
  }
}

function getInstance (path=':memory:') {
  if (!dbInstances[path]) {
    dbInstances[path] = new sqlite3.Database(path);
  }
  let db = dbInstances[path];
  return new DatabaseInstance(db);
}

function clearInstances () {
  Object.keys(dbInstances).forEach((k) => dbInstances[k].close());
  dbInstances = {}
}

module.exports = {
  DatabaseInstance,
  getInstance,
  clearInstances
}

