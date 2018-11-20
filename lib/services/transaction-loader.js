const dbUtils = require('../db/actions/util');

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
    return this.db.all(sql).then((records) => serializeTransactions(records));
  }

  getTransactions ({ accountId=null, page=1, pageSize=100, order='date' }={}) {
    const offset = page === 1 ? 0 : ((page - 1) * pageSize);
    const orderByValue = OrderOptions[order] || 'date';
    const orderClause =
      `order by ${orderByValue} desc LIMIT ${parseInt(pageSize)} OFFSET ${offset}`;

    let records, count;
    if (accountId == null || accountId == undefined) {
      records = this.db.all(`SELECT * FROM transactions  ${orderClause}`)
      count = this.db.get(`SELECT COUNT(*) as count FROM transactions`)
    } else {
      records = dbUtils.findAll(this.db, 'transactions', { account_id: accountId }, orderClause);
      count = dbUtils.count(this.db, 'transactions', { account_id: accountId });
    }

    return Promise.all([records, count])
      .then(([records, { count }]) => {
        return {
          count,
          records: serializeTransactions(records)
        }
      })
  }
}

module.exports = TransactionLoader;
