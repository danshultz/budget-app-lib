const dbUtils = require('../db/actions/util');

class BudgetBuilder {
  constructor (db) {
    this.db = db;
  }

  setMonthlyIncomeTotal ({ year, month, total }) {
    return dbUtils.createOrUpdate(
      this.db,
      'budgets',
      { year, month, total_income: total },
      ['year', 'month']
    )
  }

  setMonthlyCategoryAmount ({ year, month, categoryId, amount }) {
    const budgetRecord = this._findOrInsertBudgetRecord({ year, month });
    return this._findOrUpdateBudgetEntry({ budgetRecord, categoryId, amount });
  }

  _findOrInsertBudgetRecord({ year, month }) {
    return dbUtils.findOrCreate(
      this.db,
      'budgets',
      { year, month, total_income: 0 },
      ['year', 'month']
    )
  }

  _findOrUpdateBudgetEntry({ budgetRecord, categoryId, amount }) {
    const budgetEntryRecord = {
      budget_id: budgetRecord.id,
      transaction_category_id: categoryId,
      amount
    }

    return dbUtils.createOrUpdate(
      this.db,
      'budget_entries',
      budgetEntryRecord,
      ['budget_id', 'transaction_category_id']
    )
  }
}

module.exports = BudgetBuilder;
