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
  date: '2018-08-12 12:00:00',
  description: null,
  fit_id: '4223317601201810108',
  memo: 'Fit and Fast',
  name: '',
  payee: '',
  type: 'DEBIT',
  categories: JSON.stringify([{ key: 1, amount: -50 }]),
  category_ids: JSON.stringify([1])
}];

describe('fetching transactions', function () {
  beforeEach(function () {
    const instance = this.instance = db.getInstance(':memory:');
    db.migrate(instance, noopLogger);
    dbUtils.insertAll(instance, 'transactions', transactionData);
  });

  afterEach(function () {
    db.clearInstances();
  });

  describe('#getTransactions', function () {

    it('returns all transactions by default', function () {
      const transactionLoader = new TransactionLoader(this.instance);
      const { records, count } = transactionLoader.getTransactions();
      expect(records.length).to.eq(4);
      expect(count).to.eq(4);
    })

    it('returns transactions by account', function () {
      const transactionLoader = new TransactionLoader(this.instance);
      const { records, count } = transactionLoader.getTransactions({ accountId: 2 })
      expect(records.length).to.eq(1);
      expect(count).to.eq(1);
    })

    it('returns transactions by pages', function () {
      const transactionLoader = new TransactionLoader(this.instance);
      const { records, count } = transactionLoader.getTransactions({ page: 2, pageSize: 3 });
      expect(records.length).to.eq(1);
      expect(count).to.eq(4);
    })

    it('returns transactions by pages and accounts', function () {
      const transactionLoader = new TransactionLoader(this.instance);
      const filters = { accountId: 1, page: 2, pageSize: 1 };

      const { records, count } = transactionLoader.getTransactions(filters);
      expect(records.length).to.eq(1);
      expect(count).to.eq(3);
    })

    it('returns transactions by account and uncategorized', function () {
      const transactionLoader = new TransactionLoader(this.instance);
      const filters = { uncategorizedOnly: true, accountId: 1 };

      const { records, count } = transactionLoader.getTransactions(filters);
      // returns both uncategorized transactions instead of all 3 for the account
      expect(records.length).to.eq(2);
      expect(count).to.eq(2);
    })

    it('returns transactions for a set of categories', function () {
      const transactionLoader = new TransactionLoader(this.instance);
      const filters = { categoryId: 1 };

      const { records, count } = transactionLoader.getTransactions(filters);
      // returns both uncategorized transactions instead of all 3 for the account
      expect(records.length).to.eq(1);
      expect(count).to.eq(1);
      expect(records[0].fit_id).to.eq('4223317601201810108')
    })
  })

  describe('#getTransactionsForMonth', function () {
    it('returns all transactions for a given month and year', function () {
      const transactionLoader = new TransactionLoader(this.instance);
      const records = transactionLoader.getTransactionsForMonth({ month: 8, year: 2018 })
      expect(records.length).to.eq(1);
    })
  })

});
