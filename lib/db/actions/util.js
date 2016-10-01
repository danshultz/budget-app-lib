const _extend = require('../../util/extend');

const createParams = function (values) {
  let params = {};
  Object.keys(values).forEach((key) => params['$' + key] = values[key]);
  return params;
}

const buildWhereClause = function (values) {
  return Object.keys(values)
    .map((key) => `${key} = $${key}`)
    .join(' AND ')
}


const findAll = function (db, table, values) {
  let whereClause = buildWhereClause(values);
  let whereParams = createParams(values);

  return db.all(`SELECT * FROM ${table} WHERE ${whereClause}`, whereParams)
};


const find = function (db, table, values) {
  let whereClause = buildWhereClause(values);
  let whereParams = createParams(values);

  return db.get(`SELECT * FROM ${table} WHERE ${whereClause}`, whereParams)
};


const insert = function (db, table, values) {
  if (!values.created_at) { values.created_at = Date.now(); }
  if (!values.updated_at) { values.updated_at = Date.now(); }

  let insertFields = Object.keys(values);
  let insertParams = createParams(values);

  let insertString = insertFields.join(',');
  let insertTokenString = insertFields.map((k) => `$${k}`).join(',');

  return db.run(`INSERT INTO ${table} (${insertString}) VALUES (${insertTokenString})`, insertParams)
    .then(({ lastID }) => _extend({ id: lastID }, values));
}


const findOrCreate = function (db, table, values, findProps) {
  let findValues = {};
  findProps.forEach((p) => findValues[p] = values[p]);

  return find(db, table, findValues)
    .then((result) => result || insert(db, table, values));
}

module.exports = {
  findAll,
  find,
  insert,
  findOrCreate
}
