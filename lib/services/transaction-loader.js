const dbUtils = require('../db/actions/util');
const _ = require('lodash');

const OrderOptions = {
  date: 'date'
}

function serializeTransactions (transactions) {
  return transactions.map((t) => {
    return Object.assign({}, t, {
      created_at: new Date(t.created_at),
      updated_at: new Date(t.updated_at),
      date: new Date(t.date),
      categories: JSON.parse(t.categories)
    })
  })
}

function createSqlDate(year, month, day) {
  const monthString = month < 10 ? `0${month}` : month.toString();
  const dayString = day < 10 ? `0${day}` : day.toString();
  return [year, monthString, dayString].join('-');
}

function getAll(db, sql) {
  const statement = db.prepare(sql);
  return statement.all();
}

function getCount(db, sql) {
  const statement = db.prepare(sql);
  return statement.get().count;
}

class TransactionLoader {
  constructor (db) {
    this.db = db;
  }

  getTransactionsForMonth ({ month, year }) {
    const toYear = month === 12 ? (year + 1) : year;
    const toMonth = month === 12 ? 1 : (month + 1);

    const fromDate = createSqlDate(year, month, 1);
    const toDate = createSqlDate(toYear, toMonth, 1);

    const sql = `SELECT * FROM transactions where date between '${fromDate}' and '${toDate}'`
    const statement = this.db.prepare(sql);
    const records = statement.all();
    return serializeTransactions(records);
  }

  getTransactions ({
    uncategorizedOnly=false,
    categoryId=null,
    accountId=null,
    page=1,
    pageSize=100,
    order='date' }={}
  ) {
    // if uncategorizedOnly is true, categoryId is expected to be null.
    // This should trigger an error condition.
    if (uncategorizedOnly && categoryId > 0) {
      throw new Error('uncategorizedOnly is true and a categoryId was passed. Please pass false when using categoryId');
    }

    const offset = page === 1 ? 0 : ((page - 1) * pageSize);
    const orderByValue = OrderOptions[order] || 'date';
    const orderClause =
      `order by ${orderByValue} desc LIMIT ${parseInt(pageSize)} OFFSET ${offset}`;
    const transactionFilters = this._buildTransactionFilters({ uncategorizedOnly, accountId, categoryId })

    let records, count;
    if (_.isEmpty(transactionFilters)) {
      records = getAll(this.db, `SELECT * FROM transactions  ${orderClause}`);
      count = getCount(this.db, `SELECT COUNT(*) as count FROM transactions`);
    } else {
      let tableName = 'transactions';
      // if categoryId is passed
      if (categoryId > 0) { tableName+=',json_each(category_ids) as category_id'; }
      records = dbUtils.findAll(this.db, tableName, transactionFilters, orderClause);
      count = dbUtils.count(this.db, tableName, transactionFilters);
    }

    return {
      count,
      records: serializeTransactions(records)
    };
  }

  _buildTransactionFilters({ uncategorizedOnly, accountId, categoryId }) {
    const transactionFilters = {};

    if (_.isNumber(accountId)) {
      transactionFilters.account_id = accountId;
    }

    if (uncategorizedOnly) {
      transactionFilters.categories = '[]'
    }

    if (categoryId > 0) {
      transactionFilters["category_id.value"] = categoryId;
    }

    return transactionFilters;
  }
}

module.exports = TransactionLoader;
