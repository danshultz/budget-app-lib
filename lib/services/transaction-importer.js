const dbUtils = require('../db/actions/util');

class TransactionImporter {
  constructor (db, accountId) {
    this.db = db;
    this.accountId = accountId;
  }

  importOfxTransactions (transactions) {
    let transactionInserts = transactions.map((t) => this._insertTransactionRecord(t));
    return Promise.all(transactionInserts);
  }

  _insertTransactionRecord (ofxTransaction) {
    return dbUtils.findOrCreate(
      this.db,
      'transactions',
      this._createTransactionRecord(ofxTransaction),
      ['account_id', 'fit_id']
    )
  }

  _createTransactionRecord (ofxTransaction) {
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
      balance: ofxTransaction.balance
    }
  }

}

module.exports = TransactionImporter;
