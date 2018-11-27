const dbUtils = require('../db/actions/util');

class AccountImporter {
  constructor (db) {
    this.db = db;
  }

  import (signOn, ofxAccount) {
    return this._createOrUpdate(signOn, ofxAccount)
      .then((r) => this._maybeUpdateBalance(r, signOn, ofxAccount));
  }

  _createOrUpdate (signOn, ofxAccount) {
    return dbUtils.createOrUpdate(
      this.db,
      'accounts',
      this._createAccountRecord(signOn, ofxAccount),
      ['bank_id', 'account_id']
    )
  }

  _maybeUpdateBalance (accountRecord, signOn, ofxAccount) {
    const lastPostedAt = accountRecord.balance_posted_at && new Date(accountRecord.balance_posted_at)
    const currentPostedAt = new Date(ofxAccount.balance.postedAt);

    if (!lastPostedAt || lastPostedAt < currentPostedAt) {
      const updates = {
        id: accountRecord.id,
        balance: ofxAccount.balance.amount,
        balance_posted_at: ofxAccount.balance.postedAt
      }

      return dbUtils.update(this.db, 'accounts', updates)
        .then(() => dbUtils.find(this.db, 'accounts', { id: updates.id }));
    } else {
      return accountRecord;
    }
  }

  _createAccountRecord (signOn, ofxAccount) {
    return {
      name: signOn.fiName,
      account_type: ofxAccount.type,
      account_id: ofxAccount.id,
      bank_id: ofxAccount.bankId
    };
  }
}

module.exports = AccountImporter;
