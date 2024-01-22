const dbUtils = require('../db/actions/util');

class BudgetLoader {
  constructor (db) {
    this.db = db;
  }

  /* Fetches the budget and returns the following structure
   * {
   *   id: 1,
   *   year: 2018,
   *   month: 11,
   *   totalIncome,
   *   budgetCategories: [{ year, month, categoryId, amount }]
   * }
  */
  fetchBudget ({ year, month }) {
    const budgetRecord = this._fetchBudgetRecord({ year, month })
    const results = this._fetchBudgetCategories(budgetRecord);
    return this._buildBudget(results);
  }

  /* Fetch the budget totals and total income. Returns the following structure
   * {
   *   totalIncome: 12300,
   *   budgetTotals: [{ categoryId: 12, amount: 12300 }]
   * }
   */
  fetchBudgetTotals ({ endYear, endMonth }) {
    let statement = this.db.prepare(`
      SELECT transaction_category_id categoryId, sum(amount) as amount
      FROM budget_entries
      JOIN budgets ON budget_entries.budget_id = budgets.id
      WHERE (budgets.year < @year)
        OR (budgets.year = @year AND budgets.month <= @month)
      GROUP BY transaction_category_id
    `);
    const budgetTotals = statement.all({ 'year': endYear, 'month': endMonth });

    statement = this.db.prepare(`
      SELECT sum(total_income) as total_income
      FROM budgets
      WHERE (budgets.year < @year)
        OR (budgets.year = @year AND budgets.month <= @month)
    `);
    const incomeTotals = statement.get({ 'year': endYear, 'month': endMonth });

    return {
      totalIncome: incomeTotals.total_income,
      budgetTotals
    }
  }

  _fetchBudgetRecord({ year, month }) {
    return dbUtils.find(this.db, 'budgets', { year, month });
  }

  _fetchBudgetCategories(budgetRecord) {
    if (!budgetRecord) { return {}; }

    const budgetCategories = dbUtils.findAll(this.db, 'budget_entries', { budget_id: budgetRecord.id })
    return { budgetRecord, budgetCategories };
  }

  _buildBudget({ budgetRecord, budgetCategories }) {
    if (!budgetRecord) { return null; }
    const { id, year, month, total_income } = budgetRecord;

    return {
      id,
      year,
      month,
      totalIncome: total_income,
      budgetCategories:
        budgetCategories.map((category) => this._transformCategory({ year, month, category }))
    }
  }

  _transformCategory({ year, month, category }) {
    return {
      year,
      month,
      categoryId: category.transaction_category_id,
      amount: category.amount
    }
  }
}

module.exports = BudgetLoader;
