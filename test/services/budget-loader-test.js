const { expect } = require('chai');
const { noopLogger } = require('../support');
const db = require('../../lib/db');
const dbUtils = require('../../lib/db/actions/util');
const budgetFactory = require('../factories/budget-factory');
const BudgetLoader = require('../../lib/services/budget-loader');

describe('fetching a budget', function () {
  beforeEach(function () {
    const instance = this.instance = db.getInstance(':memory:');
    return db.migrate(instance, noopLogger)
  });

  afterEach(function () {
    return db.clearInstances();
  });

  it('return null when no budget is present', function () {
    const [year, month] = [2018, 1];
    const budgetLoader = new BudgetLoader(this.instance)

    return budgetLoader.fetchBudget({ year, month })
      .then((budget) => expect(budget).to.be.null)
  })

  it('returns a budget', function () {
    const [year, month] = [2018, 1];
    const budgetLoader = new BudgetLoader(this.instance)

    return budgetFactory.create(this.instance, { year, month, totalIncome: 43200 })
      .then(() => budgetLoader.fetchBudget({ year, month }))
      .then((budget) => {
        // verify top level structure and contents
        expect(budget).to.deep.contain({
          year,
          month,
          totalIncome: 43200
        })
        // verify budget categories
        expect(budget.budgetCategories[0]).to.deep.contain({
          year,
          month,
          categoryId: 12,
          amount: 5000
        })
      })
  });

  it('returns totals for a budget', function () {
    const year = 2018;
    const budgetLoader = new BudgetLoader(this.instance)

    return budgetFactory.create(this.instance, { year, month: 1, totalIncome: 43200 })
      .then(() => budgetFactory.create(this.instance, { year, month: 2, totalIncome: 22100 }))
      .then(() => budgetLoader.fetchBudgetTotals({ endYear: year, endMonth: 2 }))
      .then((budgetTotals) => {
        expect(budgetTotals).to.deep.contain({
          totalIncome: 43200 + 22100,
          budgetTotals: [{
            categoryId: 12,
            amount: 5000 + 5000
          }]
        })
      })

  })
});
