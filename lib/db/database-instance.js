const Database = require('better-sqlite3');
var dbInstances = {};

function getInstance (path=':memory:') {
  if (!dbInstances[path]) {
    // dbInstances[path] = new Database(path, { verbose: console.log });
    dbInstances[path] = new Database(path);
  }
  return dbInstances[path];
}

function clearInstances () {
  Object.keys(dbInstances).forEach((k) => dbInstances[k].close());
  dbInstances = {}
}

module.exports = {
  getInstance,
  clearInstances
}

