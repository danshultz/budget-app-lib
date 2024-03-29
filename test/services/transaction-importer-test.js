const { expect } = require('chai');
const { noopLogger } = require('../support');
const db = require('../../lib/db');
const TransactionImporter = require('../../lib/services/transaction-importer');

var transactions = [{
  amount: -2300,
  fitId: '219867',
  name: 'Interest Charge',
  postedAt: '2005-08-11 08:00:00',
  type: 'INT',
}, {
  amount: 35000,
  fitId: '219868',
  name: 'Payment - Thank You',
  postedAt: '2005-08-11 08:00:00',
  type: 'CREDIT',
}];


var accountId = 4;

describe('importing transactions', function () {
  beforeEach(function () {
    let instance = this.instance = db.getInstance(':memory:');
    db.migrate(instance, noopLogger);
  });

  afterEach(function () {
    db.clearInstances();
  });

  it('imports the transactions', function () {
    let importer = new TransactionImporter(this.instance, accountId);

    importer.import(transactions, 5000);
    const statement = this.instance.prepare('SELECT * FROM transactions');
    const data = statement.all();
    expect(data.length).to.equal(2);
    expect(data[0]).to.deep.contain({
      fit_id: '219867',
      type: 'INT',
      date: '2005-08-11 08:00:00',
      description: null,
      memo: null,
      name: 'Interest Charge',
      payee: null,
      check_number: null,
      amount: -2300,
      balance: 5000,
      account_id: 4
    });

    expect(data[1].balance).to.equal(7300);
  });
});
