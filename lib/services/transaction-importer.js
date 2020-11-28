const dbUtils = require('../db/actions/util');
const _ = require('lodash');

class TransactionImporter {
  constructor (db, accountId) {
    this.db = db;
    this.accountId = accountId;
  }

  import (transactions, balance) {
    const sortedTransactions = _.orderBy(transactions, ['postedAt', 'amount'], ['desc', 'asc']);

    let transactionInserts = sortedTransactions.map((t) => {
      let insert = this._insertTransactionRecord(t, balance)
      balance = (balance - t.amount);
      return insert;
    });

    // sort the results returned again by 'date' because it's expected to return the results
    // ordered by date. sqlite inserts the records in an undetermined order because it happens
    // assync.
    return Promise.all(transactionInserts)
      .then((trans) => _.orderBy(trans, ['date'], ['desc']));
  }

  _insertTransactionRecord (ofxTransaction, balance) {
    return dbUtils.findOrCreate(
      this.db,
      'transactions',
      this._createTransactionRecord(ofxTransaction, balance),
      ['account_id', 'fit_id']
    )
  }

  _createTransactionRecord (ofxTransaction, balance) {
    return {
      account_id: this.accountId,
      amount: ofxTransaction.amount,
      check_number: ofxTransaction.checkNumber,
      date: ofxTransaction.postedAt,
      fit_id: ofxTransaction.fitId,
      memo: ofxTransaction.memo,
      name: ofxTransaction.name,
      payee: ofxTransaction.payee,
      type: ofxTransaction.type,
      balance: balance
    }
  }

}

module.exports = TransactionImporter;
