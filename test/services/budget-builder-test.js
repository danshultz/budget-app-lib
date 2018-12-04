const { expect } = require('chai');
const { noopLogger } = require('../support');
const db = require('../../lib/db');
const dbUtils = require('../../lib/db/actions/util');
const BudgetBuilder = require('../../lib/services/budget-builder');

describe('building a budget', function () {
  beforeEach(function () {
    const instance = this.instance = db.getInstance(':memory:');
    return db.migrate(instance, noopLogger)
  });

  afterEach(function () {
    return db.clearInstances();
  });

  describe('#setMonthlyIncomeTotal', function () {

    it('sets budget budet total income', function () {
      const [year, month] = [2018, 1];
      const budgetBuilder = new BudgetBuilder(this.instance);

      // insert initial budget total
      return budgetBuilder.setMonthlyIncomeTotal({ year, month, total: 123400 })
        // fetch budgets record
        .then(() => dbUtils.find(this.instance, 'budgets', { year, month }))
        // verify budget record values
        .then((budgetRecord) => {
          expect(budgetRecord).to.deep.contain({
            month,
            year,
            total_income: 123400,
          })
        })
    })

    it('updates budget total income', function () {
      const [year, month] = [2018, 1];
      const budgetBuilder = new BudgetBuilder(this.instance);

      // insert initial budget total
      return budgetBuilder.setMonthlyIncomeTotal({ year, month, total: 123400 })
        // update budget total
        .then(() => budgetBuilder.setMonthlyIncomeTotal({ year, month, total: 523400 }))
        // fetch budgets record
        .then(() => dbUtils.find(this.instance, 'budgets', { year, month }))
        // verify budget record values
        .then((budgetRecord) => {
          expect(budgetRecord).to.deep.contain({
            month,
            year,
            total_income: 523400,
          })
        })
    })

  });


});
