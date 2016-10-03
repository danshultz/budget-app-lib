const dbUtils = require('../db/actions/util');

class TransactionImporter {
  constructor (db, accountId) {
    this.db = db;
    this.accountId = accountId;
  }

  importOfxTransactions (transactions) {
    let transactionInserts = transactions.map((t) => this.upsertOfxTransaction(t));
    return Promise.all(transactionInserts);
  }

  upsertOfxTransaction (transaction) {
    let queryParams = {
      $accountId: this.accountId,
      $fitId: transaction.fitId
    };
    return this.db.get(`
      SELECT * FROM transactions
      WHERE account_id = $accountId AND fit_id = $fitId`, queryParams
    ).then((record) => {
      if (record) {
        return this._updateTransaction(record, transaction);
      } else {
        return this._insertTransaction(transaction);
      }
    });
  }

  _updateTransaction (record, ofxTransaction) {
    let data = this._createTransactionRecord(ofxTransaction);
    return this.db.run(`
      UPDATE transactions
        SET amount = $amount,
        SET check_number = $check_number,
        SET date = $date,
        SET fit_id = $fit_id,
        SET memo = $memo,
        SET name = $name,
        SET payee = $payee,
        SET type = $type
      WHERE id = ${record.id}
    `, data);
  }

  _insertTransaction (ofxTransaction) {
    let data = this._createTransactionRecord(ofxTransaction);
    data.$account_id = this.accountId;
    return this.db.run(`
      INSERT INTO transactions (
        account_id,
        amount,
        check_number,
        date,
        fit_id,
        memo,
        name,
        payee,
        type,
        balance
      ) values (
        $account_id,
        $amount,
        $check_number,
        $date,
        $fit_id,
        $memo,
        $name,
        $payee,
        $type,
        40
      )
    `, data);
  }

  _createTransactionRecord (ofxTransaction) {
    return {
      $amount: ofxTransaction.amount,
      $check_number: ofxTransaction.checkNumber,
      $date: ofxTransaction.postedAt,
      $fit_id: ofxTransaction.fitId,
      $memo: ofxTransaction.memo,
      $name: ofxTransaction.name,
      $payee: ofxTransaction.payee,
      $type: ofxTransaction.type
    }
  }

}

module.exports = TransactionImporter;
