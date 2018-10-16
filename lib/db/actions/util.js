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

const buildUpdateClause = function (values) {
  return Object.keys(values)
    .map((key) => `${key} = $${key}`)
    .join(', ');
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

const update = function (db, table, values) {
  if (!values.id) {
    throw new Error('id is required to be present on values');
  }

  if (!values.updated_at) { values.updated_at = Date.now(); }

  let updateParams = createParams(values);
  let updateClause = buildUpdateClause(values);
  let whereClause = buildWhereClause({ id: values.id });

  return db.run(`UPDATE ${table} SET ${updateClause} WHERE ${whereClause}`, updateParams)
    .then(({ changes }) => changes);
}


const findOrCreate = function (db, table, values, findProps) {
  let findValues = {};
  findProps.forEach((p) => findValues[p] = values[p]);

  return find(db, table, findValues)
    .then((result) => result || insert(db, table, values));
}

const createOrUpdate = function (db, table, values, findProps) {
  let findValues = {};
  findProps.forEach((p) => findValues[p] = values[p]);

  return find(db, table, findValues)
    .then((result) => {
      if (result) {
        values = _extend(values, { id: result.id });
        return update(db, table, values).then(() => values);
      } else {
        return insert(db, table, values);
      }
    });
}

module.exports = {
  findAll,
  find,
  insert,
  update,
  findOrCreate,
  createOrUpdate
}
