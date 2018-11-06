const chai = require('chai');
const { expect, assert } = chai;
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const { noopLogger } = require('../support');
const db = require('../../lib/db');
const dbUtils = require('../../lib/db/actions/util');
const TransactionLoader = require('../../lib/services/transaction-loader');

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
  amount: -50,
  balance: 10100,
  check_number: '',
  date: '2018-10-07 12:00:00',
  description: null,
  fit_id: '4223317601201810108',
  memo: 'Fit and Fast',
  name: '',
  payee: '',
  type: 'DEBIT',
}];

describe('fetching transactions', function () {
  beforeEach(function () {
    const instance = this.instance = db.getInstance(':memory:');
    return db.migrate(instance, noopLogger)
      .then(() => dbUtils.insertAll(instance, 'transactions', transactionData))
  });

  afterEach(function () {
    db.clearInstances();
  });

  it('returns all transactions by default', function () {
    const transactionLoader = new TransactionLoader(this.instance);
    return transactionLoader.getTransactions().then(({ records, count }) => {
      expect(records.length).to.eq(4);
      expect(count).to.eq(4);
    })
  })

  it('returns transactions by account', function () {
    const transactionLoader = new TransactionLoader(this.instance);
    return transactionLoader.getTransactions({ accountId: 2 }).then(({ records, count }) => {
      expect(records.length).to.eq(1);
      expect(count).to.eq(1);
    })
  })

  it('returns transactions by pages', function () {
    const transactionLoader = new TransactionLoader(this.instance);
    return transactionLoader.getTransactions({ page: 2, pageSize: 3 }).then(({ records, count }) => {
      expect(records.length).to.eq(1);
      expect(count).to.eq(4);
    })
  })

  it('returns transactions by pages and accounts', function () {
    const transactionLoader = new TransactionLoader(this.instance);
    return transactionLoader.getTransactions({ accountId: 1, page: 2, pageSize: 1 }).then(({ records, count }) => {
      expect(records.length).to.eq(1);
      expect(count).to.eq(3);
    })
  })

});
