const _extend = require('../../util/extend');
const _ = require('lodash');

const createParam = function (p) {
  return `${_.replace(p, '.', '_')}`
}

const createParams = function (values) {
  let params = {};
  Object.keys(values).forEach((key) => params[createParam(key)] = values[key]);
  return params;
}

const buildWhereClause = function (values) {
  return Object.keys(values)
    .map((key) => `${key} = @${createParam(key)}`)
    .join(' AND ')
}

const buildUpdateClause = function (values) {
  return Object.keys(values)
    .map((key) => `${key} = @${createParam(key)}`)
    .join(', ');
}


const findAll = function (db, table, values, orderClause="order by id asc") {
  let whereClause = buildWhereClause(values);
  let whereParams = createParams(values);

  const sql = `SELECT * FROM ${table} WHERE ${whereClause} ${orderClause}`
  const statement = db.prepare(sql);
  return statement.all(whereParams);
};

const count = function (db, table, values) {
  let whereClause = buildWhereClause(values);
  let whereParams = createParams(values);

  const sql = `SELECT COUNT(*) as count FROM ${table} WHERE ${whereClause}`
  const statement = db.prepare(sql);
  return statement.get(whereParams);
};

const find = function (db, table, values) {
  let whereClause = buildWhereClause(values);
  let whereParams = createParams(values);

  const sql = `SELECT * FROM ${table} WHERE ${whereClause}`
  const statement = db.prepare(sql);
  return statement.get(whereParams);
};


const insert = function (db, table, values) {
  if (!values.created_at) { values.created_at = Date.now(); }
  if (!values.updated_at) { values.updated_at = Date.now(); }

  let insertFields = Object.keys(values);
  let insertParams = createParams(values);

  let insertString = insertFields.join(',');
  let insertTokenString = insertFields.map((k) => `@${k}`).join(',');

  const sql = `INSERT INTO ${table} (${insertString}) VALUES (${insertTokenString})`;
  const insert = db.prepare(sql);
  const result = insert.run(insertParams);
  // { changes: 1, lastInsertRowid: 1 }

  return _extend({ id: result.lastInsertRowid }, values);
}

const insertAll = function (db, table, records) {
  return records.map((r) => insert(db, table, r));
}

const update = function (db, table, values) {
  if (!values.id) {
    throw new Error('id is required to be present on values');
  }

  if (!values.updated_at) { values.updated_at = Date.now(); }

  let updateParams = createParams(values);
  let updateClause = buildUpdateClause(values);
  let whereClause = buildWhereClause({ id: values.id });

  const sql = `UPDATE ${table} SET ${updateClause} WHERE ${whereClause}`
  const statement = db.prepare(sql);
  return statement.run(updateParams);
}


const findOrCreate = function (db, table, values, findProps) {
  let findValues = {};
  findProps.forEach((p) => findValues[p] = values[p]);

  const result = find(db, table, findValues)
  return result || insert(db, table, values);
}

const createOrUpdate = function (db, table, values, findProps) {
  let findValues = {};
  findProps.forEach((p) => findValues[p] = values[p]);

  let record = find(db, table, findValues);
  if (record) {
    values = _extend({}, values, { id: record.id });
    update(db, table, values);
    return _extend({}, record, values);
  } else {
    return insert(db, table, values);
  }
}

module.exports = {
  findAll,
  find,
  insert,
  insertAll,
  update,
  findOrCreate,
  createOrUpdate,
  count
}
