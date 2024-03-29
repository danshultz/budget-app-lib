const { expect } = require('chai');
const { noopLogger } = require('../support');
const db = require('../../lib/db');
const dbUtils = require('../../lib/db/actions/util');
const BudgetBuilder = require('../../lib/services/budget-builder');

describe('building a budget', function () {
  beforeEach(function () {
    const instance = this.instance = db.getInstance(':memory:');
    db.migrate(instance, noopLogger)
  });

  afterEach(function () {
    return db.clearInstances();
  });

  describe('#setMonthlyIncomeTotal', function () {

    it('sets budget budet total income', function () {
      const [year, month] = [2018, 1];
      const budgetBuilder = new BudgetBuilder(this.instance);

      // insert initial budget total
      budgetBuilder.setMonthlyIncomeTotal({ year, month, total: 123400 });
      // fetch budgets record
      const budgetRecord = dbUtils.find(this.instance, 'budgets', { year, month });
      // verify budget record values
      expect(budgetRecord).to.deep.contain({
        month,
        year,
        total_income: 123400,
      });
    })

    it('updates budget total income', function () {
      const [year, month] = [2018, 1];
      const budgetBuilder = new BudgetBuilder(this.instance);

      // insert initial budget total
      budgetBuilder.setMonthlyIncomeTotal({ year, month, total: 123400 });
      // update budget total
      budgetBuilder.setMonthlyIncomeTotal({ year, month, total: 523400 });
      // fetch budgets record
      const budgetRecord = dbUtils.find(this.instance, 'budgets', { year, month });
      // verify budget record values
      expect(budgetRecord).to.deep.contain({
        month,
        year,
        total_income: 523400,
      });
    })

  });

  describe('#setMonthlyCategoryAmount', function () {

    it('sets the category amount', function () {
      const [year, month] = [2018, 1];
      const budgetBuilder = new BudgetBuilder(this.instance);

      // insert initial category total
      budgetBuilder.setMonthlyCategoryAmount({ year, month, categoryId: 12, amount: 12300 });
      // fetch budget_entries record, assume single record created
      const budgetEntryRecord = dbUtils.find(this.instance, 'budget_entries', { id: 1 });
      // verify record values
      expect(budgetEntryRecord).to.deep.contain({
        budget_id: 1, // it created a default record
        transaction_category_id: 12,
        amount: 12300
      });
    })

    it('updates the category amount', function () {
      const [year, month] = [2018, 1];
      const budgetBuilder = new BudgetBuilder(this.instance);

      // insert initial category total
      budgetBuilder.setMonthlyCategoryAmount({ year, month, categoryId: 12, amount: 12300 });
      // update the record
      budgetBuilder.setMonthlyCategoryAmount({ year, month, categoryId: 12, amount: 52300 });
      // fetch budget_entries record, assume single record created
      const budgetEntryRecord = dbUtils.find(this.instance, 'budget_entries', { id: 1 });
      // verify record values
      expect(budgetEntryRecord).to.deep.contain({
        budget_id: 1, // it created a default record
        transaction_category_id: 12,
        amount: 52300
      });
    })
  });
});
