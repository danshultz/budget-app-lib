function createSqlDate(year, month, day) {
  const monthString = month < 10 ? `0${month}` : month.toString();
  const dayString = day < 10 ? `0${day}` : day.toString();
  return [year, monthString, dayString].join('-');
}

class TransactionCategoryReport {
  constructor (db) {
    this.db = db;
  }

  getReport ({ endYear, endMonth }) {
    return this._fetchTransactionTotals({ endYear, endMonth });
  }

  _fetchTransactionTotals ({ endYear, endMonth }) {
    // get next month
    const month = endMonth === 12 ? 1 : endMonth + 1;
    // increment year if we rolled over the month
    const year = endMonth === 12 ? endYear + 1 : endYear;

    const beforeDate = createSqlDate(year, month, 1);

    const sql = `
      SELECT
        transaction_categories.year as year,
        transaction_categories.month as month,
        transaction_categories.transaction_category_id AS transactionCategoryId,
        SUM(transaction_categories.amount) AS amount
      FROM (
        SELECT
          transactions.id,
          CAST(strftime('%Y', transactions.date) AS INT) as year,
          CAST(strftime('%m', transactions.date) AS INT) as month,
          json_extract(categories.value, '$.key') as transaction_category_id,
          json_extract(categories.value, '$.amount') as amount
        FROM transactions, json_each(categories) as categories
        WHERE transactions.date < '${beforeDate}'
      ) transaction_categories
      GROUP BY
        transaction_categories.year,
        transaction_categories.month,
        transaction_categories.transaction_category_id;
    `;
    const statment = this.db.prepare(sql);
    return statment.all();
  }
}

module.exports = TransactionCategoryReport;
