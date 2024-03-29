const chai = require('chai');
const { expect, assert } = chai;
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const { noopLogger } = require('../support');
const db = require('../../lib/db');
const dbUtils = require('../../lib/db/actions/util');
const DesciptionSetService = require('../../lib/services/description-set-service');

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

describe('setting the description', function () {
  beforeEach(function () {
    let instance = this.instance = db.getInstance(':memory:');
    db.migrate(instance, noopLogger);
  });

  afterEach(function () {
    db.clearInstances();
  });

  it('fails when attempting to set the description for an invalid transaction', function () {
    let descriptionSetService = new DesciptionSetService(this.instance);
    assert.throws(
      () => { descriptionSetService.setDescription(99, 'foo') },
      Error,
      "transaction with id 99 doesn't exist"
    );
  })

  it('sets categories', function () {
    let descriptionSetService = new DesciptionSetService(this.instance);

    // create record to update
    const transactionRecord = dbUtils.insert(this.instance, 'transactions', transactionData);
    // set the description
    const updatedRecord = descriptionSetService.setDescription(transactionRecord.id, 'test description');
    // verify the description was updated correctly
    expect(updatedRecord).to.deep.contain({
      id: 1,
      description: 'test description'
    });
  })

})
