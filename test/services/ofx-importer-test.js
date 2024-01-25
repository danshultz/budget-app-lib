const { expect } = require('chai');
var path = require('path');
const { noopLogger } = require('../support');
const db = require('../../lib/db');
const OfxImporter = require('../../lib/services/ofx-importer');

var FIXTURE_FILE = path.join(__dirname, '../fixtures/test1.ofx');

describe('importing an ofx file', function () {
  beforeEach(function () {
    let instance = this.instance = db.getInstance(':memory:');
    db.migrate(instance, noopLogger);
  });

  afterEach(function () {
    db.clearInstances();
  });

  it('imports the ofx records and returns them', function () {
    ofxImporter = new OfxImporter(this.instance, noopLogger);
    const { accountRecord, transactionRecords } = ofxImporter.import(FIXTURE_FILE)

    expect(accountRecord).to.deep.contain({
      id: 1,
      name: 'FOO BANK',
      account_type: 'CHECKING',
      account_id: '123456',
      bank_id: '000000123',
      balance: 947148,
      balance_posted_at: '2018-10-15 12:00:00'
    })

    expect(transactionRecords.length).to.equal(5);
    expect(transactionRecords[3]).to.deep.contain({
      id: 4,
      account_id: 1,
      amount: -350000,
      check_number: '',
      date: '2018-10-10 12:00:00',
      fit_id: '4223317601201810103',
      memo: '',
      name: 'ONLINE TRANSFER TO XXXXX8741',
      payee: '',
      type: 'DEBIT',
      balance: 528188
    })
  })

  it('it can be run multiple times in a row and does not create duplicate records', function () {
    ofxImporter = new OfxImporter(this.instance, noopLogger);
    ofxImporter.import(FIXTURE_FILE);
    ofxImporter.import(FIXTURE_FILE);
    const { accountRecord, transactionRecords } = ofxImporter.import(FIXTURE_FILE);
    expect(accountRecord).to.deep.contain({
      id: 1,
      name: 'FOO BANK',
      account_type: 'CHECKING',
      account_id: '123456',
      bank_id: '000000123',
      balance: 947148,
      balance_posted_at: '2018-10-15 12:00:00'
    })

    expect(transactionRecords.length).to.equal(5);
    expect(transactionRecords[3]).to.deep.contain({
      id: 4,
      account_id: 1,
      amount: -350000,
      check_number: '',
      date: '2018-10-10 12:00:00',
      fit_id: '4223317601201810103',
      memo: '',
      name: 'ONLINE TRANSFER TO XXXXX8741',
      payee: '',
      type: 'DEBIT',
      balance: 528188
    });
  })

})
