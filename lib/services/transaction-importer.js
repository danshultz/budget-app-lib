const dbUtils = require('../db/actions/util');

class TransactionImporter {
  constructor (db, accountId) {
    this.db = db;
    this.accountId = accountId;
  }

  import (transactions, balance) {
    let transactionInserts = transactions.map((t) => {
      let insert = this._insertTransactionRecord(t, balance)
      balance = (balance - t.amount);
      return insert;
    });
    return Promise.all(transactionInserts);
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
