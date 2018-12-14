const dbUtils = require('../db/actions/util');
const _ = require('lodash');

function createSqlDate(year, month, day) {
  const monthString = month < 10 ? `0${month}` : month.toString();
  const dayString = day < 10 ? `0${day}` : day.toString();
  return [year, monthString, dayString].join('-');
}

class BudgetRollupReport {
  constructor (db) {
    this.db = db;
  }

  getReport ({ endYear, endMonth }) {
    return Promise.all([
      this._fetchBudgetTotals({ endYear, endMonth }),
      this._fetchTransactionTotals({ endYear, endMonth })
    ]).then(([budgetTotals, transactionTotals]) =>
      this._buildReport({ budgetTotals, transactionTotals })
    )
  }

  _buildReport ({ budgetTotals, transactionTotals }) {
    const budgetCategoriesDict = _.keyBy(budgetTotals.budgetCategoryTotals, 'transactionCategoryId');
    const transactionCategoriesDict = _.keyBy(transactionTotals, 'transactionCategoryId');
    const allCategoryKeys =
      Object.keys(budgetCategoriesDict).concat(Object.keys(transactionCategoriesDict));

    // create a collection of { transactionCategoryId, budgetAmount, transactionAmount } objects
    return _.chain(allCategoryKeys)
      .map((i) => parseInt(i, 10)) // convert back to numbers from strings
      .sortBy((i) => i) // sort as numbers
      .sortedUniq() // unique only
      .reduce((accum, id) => {
        accum.push({
          transactionCategoryId: id,
          budgetAmount: _.get(budgetCategoriesDict, `${id}.amount`, null),
          transactionAmount: _.get(transactionCategoriesDict, `${id}.amount`, null)
        });
        return accum;
      }, [])
      .value();
  }

  /* Fetch the budget totals and total income. Returns the following structure
   * {
   *   totalIncome: 12300,
   *   budgetCategoryTotals: [{ transactionCategoryId: 12, amount: 12300 }]
   * }
   */
  _fetchBudgetTotals ({ endYear, endMonth }) {
    const budgetCategoryTotals = this.db.all(`
      SELECT
        transaction_category_id AS transactionCategoryId,
        sum(amount) AS amount
      FROM budget_entries
      JOIN budgets ON budget_entries.budget_id = budgets.id
      WHERE (budgets.year < $year)
        OR (budgets.year = $year AND budgets.month <= $month)
      GROUP BY transaction_category_id
    `, { '$year': endYear, '$month': endMonth })
    const incomeTotals = this.db.get(`
      SELECT sum(total_income) as total_income
      FROM budgets
      WHERE budgets.year <= $year
        AND budgets.month <= $month
    `, { '$year': endYear, '$month': endMonth })

    return Promise.all([incomeTotals, budgetCategoryTotals])
      .then(([totalIncomeResult, budgetCategoryTotals]) => ({
        totalIncome: totalIncomeResult.total_income,
        budgetCategoryTotals
      }))
  }

  _fetchTransactionTotals ({ endYear, endMonth }) {
    // get next month
    const month = endMonth === 12 ? 1 : endMonth + 1;
    // increment year if we rolled over the month
    const year = endMonth === 12 ? endYear + 1 : endYear;

    const beforeDate = createSqlDate(year, month, 1);

    return this.db.all(`
      SELECT
        transaction_categories.transaction_category_id AS transactionCategoryId,
        SUM(transaction_categories.amount) AS amount
      FROM (
        SELECT
          transactions.id,
          json_extract(categories.value, '$.key') as transaction_category_id,
          json_extract(categories.value, '$.amount') as amount
        FROM transactions, json_each(categories) as categories
        WHERE transactions.date < '${beforeDate}'
      ) transaction_categories
      GROUP BY transaction_categories.transaction_category_id;
    `);
  }
}

module.exports = BudgetRollupReport;
