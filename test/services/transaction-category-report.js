const { expect } = require('chai');
const { noopLogger } = require('../support');
const db = require('../../lib/db');
const dbUtils = require('../../lib/db/actions/util');
const budgetFactory = require('../factories/budget-factory');
const TransactionCategoryReport = require('../../lib/services/transaction-category-report');

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

describe('Transcation Category Report', function () {
  beforeEach(function () {
    const instance = this.instance = db.getInstance(':memory:');
    db.migrate(instance, noopLogger)
    dbUtils.insertAll(instance, 'transactions', transactionData);
  });

  afterEach(function () {
    return db.clearInstances();
  });

  it('returns an empty collection when no data is present', function () {
    const [year, month] = [2018, 1];
    const transactionCategoryReport  = new TransactionCategoryReport(this.instance)

    const report = transactionCategoryReport.getReport({ endYear: year, endMonth: month });
    expect(report).to.be.empty;
  })

  it('return a propery built collection of data', function () {
    const [year, month] = [2019, 1];
    const transactionCategoryReport  = new TransactionCategoryReport(this.instance);

    const report = transactionCategoryReport.getReport({ endYear: year, endMonth: month });
    expect(report).to.deep.equal([
      { year: 2018, month: 8, transactionCategoryId: 18, amount: -5000 },
      { year: 2018, month: 10, transactionCategoryId: 5, amount: -600 },
      { year: 2018, month: 10, transactionCategoryId: 12, amount: -1550 }
    ]);
  })
});
