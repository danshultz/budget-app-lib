const { expect } = require('chai');
const { noopLogger } = require('../support');
const db = require('../../lib/db');
const dbUtils = require('../../lib/db/actions/util');
const budgetFactory = require('../factories/budget-factory');
const BudgetRollupReport = require('../../lib/services/budget-rollup-report');

var transactionData = [{
  account_id: 1,
  amount: -1250,
  balance: 9000,
  check_number: '',
  date: '2018-10-11 12:00:00',
  description: null,
  fit_id: '4223317601201810111',
  memo: 'WALMART DEBIT CRD ACH TRAN',
  name: 'ACH DEBIT XXXXX1122',
  payee: '',
  type: 'DEBIT',
  categories: JSON.stringify([{ key: 12, amount: -1250 }])
}, {
  account_id: 1,
  amount: -900,
  balance: 10050,
  check_number: '',
  date: '2018-10-10 12:00:00',
  description: null,
  fit_id: '4223317601201810110',
  memo: 'Gas n Go',
  name: 'ACH DEBIT XXXXX1111',
  payee: '',
  type: 'DEBIT',
  categories: JSON.stringify([{ key: 5, amount: -600 }, { key: 12, amount: -300 }])
}, {
  account_id: 2,
  amount: -50,
  balance: 450,
  check_number: '',
  date: '2018-10-09 12:00:00',
  description: null,
  fit_id: '4223317601201810121',
  memo: 'Sams Club',
  name: '',
  payee: '',
  type: 'DEBIT',
}, {
  account_id: 1,
  amount: -5000,
  balance: 10100,
  check_number: '',
  date: '2018-08-12 12:00:00',
  description: null,
  fit_id: '4223317601201810108',
  memo: 'Fit and Fast',
  name: '',
  payee: '',
  type: 'DEBIT',
  categories: JSON.stringify([{ key: 18, amount: -5000 }])
}];

describe('Budget Rollup Report', function () {
  beforeEach(function () {
    const instance = this.instance = db.getInstance(':memory:');
    return db.migrate(instance, noopLogger)
      .then(() => dbUtils.insertAll(instance, 'transactions', transactionData))
  });

  afterEach(function () {
    return db.clearInstances();
  });

  it('returns an empty collection when no data is present', function () {
    const [year, month] = [2018, 1];
    const budgetRollupReport = new BudgetRollupReport(this.instance)

    return budgetRollupReport.getReport({ endYear: year, endMonth: month })
      .then((budget) => expect(budget).to.be.empty)
  })

  it('return a propery built collection of data', function () {
    const year = 2018;
    const budgetRollupReport = new BudgetRollupReport(this.instance)
    const octCategories = [
      { categoryId: 12, amount: 4000 },
      { categoryId: 99, amount: 1234 }
    ]

    return budgetFactory.create(this.instance, { year, month: 8, totalIncome: 43200 })
      .then(() => budgetFactory.create(this.instance, { year, month: 10, totalIncome: 22100, categories: octCategories }))
      .then(() => budgetRollupReport.getReport({ endYear: year, endMonth: 10 }))
      .then((budgetReport) => {
        expect(budgetReport).to.deep.equal([
          { categoryId: 5, budgetAmount: null, transactionAmount: -600 },
          { categoryId: 12, budgetAmount: 9000, transactionAmount: -1550 },
          { categoryId: 18, budgetAmount: null, transactionAmount: -5000 },
          { categoryId: 99, budgetAmount: 1234, transactionAmount: null }
        ])
      })

  })
});
