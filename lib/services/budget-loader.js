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
    return this._fetchBudgetRecord({ year, month })
      .then((budgetRecord) => this._fetchBudgetCategories(budgetRecord))
      .then((results) => this._buildBudget(results));
  }

  _fetchBudgetRecord({ year, month }) {
    return dbUtils.find(this.db, 'budgets', { year, month });
  }

  _fetchBudgetCategories(budgetRecord) {
    if (!budgetRecord) { return {}; }

    return dbUtils.findAll(this.db, 'budget_entries', { budget_id: budgetRecord.id })
      .then((budgetCategories) => ({ budgetRecord, budgetCategories }));
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
