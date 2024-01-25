const chai = require('chai');
const { expect, assert } = chai;
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const { noopLogger } = require('../support');
const db = require('../../lib/db');
const dbUtils = require('../../lib/db/actions/util');
const CategorySetService = require('../../lib/services/category-set-service');

var transactionData = {
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
}

describe('setting categories', function () {
  beforeEach(function () {
    let instance = this.instance = db.getInstance(':memory:');
    db.migrate(instance, noopLogger);
  });

  afterEach(function () {
    db.clearInstances();
  });

  it('fails when attempting to set categories for an invalid transaction', function () {
    let categorySetService = new CategorySetService(this.instance);
    assert.throws(
      () => { categorySetService.setCategories(99, null) },
      Error,
      "transaction with id 99 doesn't exist"
    );
  })

  it('sets categories', function () {
    let categorySetService = new CategorySetService(this.instance);
    let categories = [
      { key: 'office_supplies', amount: -650 },
      { key: 'gifts', amount: -600 },
    ];

    // create record to update
    const transactionRecord =  dbUtils.insert(this.instance, 'transactions', transactionData);
    // set the categories
    const updatedRecord =  categorySetService.setCategories(transactionRecord.id, categories);
    // verify the categories were updated correctly
    expect(updatedRecord).to.deep.contain({
      id: 1,
      categories: categories
    });
  });

  it('it throws an error for categories that do not total the amount', function () {
    let categorySetService = new CategorySetService(this.instance);
    let categories = [{ key: 'office_supplies', amount: -650 }];

    // create record to update
    const transactionRecord = dbUtils.insert(this.instance, 'transactions', transactionData)
    // attempt to set the categories
    assert.throws(
      () => { categorySetService.setCategories(transactionRecord.id, categories) },
      Error,
      "categories sum -650 must add up to transaction amount of -1250"
    );
  })

})
