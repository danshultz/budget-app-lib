const dbUtils = require('../db/actions/util');

class AccountImporter {
  constructor (db, accountId) {
    this.db = db;
  }

  import (signOn, ofxAccount) {
    return dbUtils.createOrUpdate(
      this.db,
      'accounts',
      this._createAccountRecord(signOn, ofxAccount),
      ['bank_id', 'account_id']
    )
  }

  _createAccountRecord (signOn, ofxAccount) {
    return {
      name: signOn.fiName,
      account_type: ofxAccount.type,
      account_id: ofxAccount.id,
      bank_id: ofxAccount.bankId,
      balance: ofxAccount.balance,
    };
  }

}

module.exports = AccountImporter;
