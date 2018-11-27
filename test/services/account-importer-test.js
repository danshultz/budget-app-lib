const { expect } = require('chai');
const { noopLogger } = require('../support');
const db = require('../../lib/db');
const dbUtils = require('../../lib/db/actions/util');
const AccountImporter = require('../../lib/services/account-importer');

const signOn = { fiName: "Test Bank" };
const ofxAccount = {
  id: '123456',
  type: 'CHECKING',
  bankId: '000000123',
  balance: { amount: 556, postedAt: '2018-10-15 12:00:00' }
}


describe('importing accounts', function () {
  beforeEach(function (done) {
    let instance = this.instance = db.getInstance(':memory:');
    db.migrate(instance, noopLogger).then(done).catch(done);
  });

  afterEach(function () {
    db.clearInstances();
  });

  it('imports the account as expected', function () {
    const accountImporter = new AccountImporter(this.instance);
    return accountImporter.import(signOn, ofxAccount)
      // refetch the record from the db to check what was stored
      .then((record) => dbUtils.find(this.instance, 'accounts', { id: record.id }))
      .then((accountRecord) => {
        expect(accountRecord).to.deep.contain({
          name: 'Test Bank',
          account_type: 'CHECKING',
          account_id: '123456',
          bank_id: '000000123',
          balance: 556,
          balance_posted_at: '2018-10-15 12:00:00'
        })
      })
  })

  it('does not update the balance if the postedAt date is earlier', function () {
    const secondBalance = { amount: 6877, postedAt: '2018-10-01 12:00:00' };
    const secondOfxAccount = Object.assign({}, ofxAccount, { balance: secondBalance })
    const accountImporter = new AccountImporter(this.instance);

    return accountImporter.import(signOn, ofxAccount)
      .then(() => accountImporter.import(signOn, secondOfxAccount))
      // refetch the record from the db to check what was stored
      .then((record) => dbUtils.find(this.instance, 'accounts', { id: record.id }))
      .then((accountRecord) => {
        expect(accountRecord).to.deep.contain({
          name: 'Test Bank',
          account_type: 'CHECKING',
          account_id: '123456',
          bank_id: '000000123',
          balance: 556,
          balance_posted_at: '2018-10-15 12:00:00'
        })
      })
  })

  it('updates the balance if the postedAt is later', function () {
    const secondBalance = { amount: 6877, postedAt: '2018-10-22 12:00:00' };
    const secondOfxAccount = Object.assign({}, ofxAccount, { balance: secondBalance })
    const accountImporter = new AccountImporter(this.instance);

    return accountImporter.import(signOn, ofxAccount)
      .then(() => accountImporter.import(signOn, secondOfxAccount))
      // refetch the record from the db to check what was stored
      .then((record) => dbUtils.find(this.instance, 'accounts', { id: record.id }))
      .then((accountRecord) => {
        expect(accountRecord).to.deep.contain({
          name: 'Test Bank',
          account_type: 'CHECKING',
          account_id: '123456',
          bank_id: '000000123',
          balance: 6877,
          balance_posted_at: '2018-10-22 12:00:00'
        })
      })
  })

})
