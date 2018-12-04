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

  setMonthlyCategoryAmount ({ year, month, amount }) {
  }

}

module.exports = BudgetBuilder;
