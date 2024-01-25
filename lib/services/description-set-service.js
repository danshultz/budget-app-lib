const dbUtils = require('../db/actions/util');

class DescriptionSetService {
  constructor (db) {
    this.db = db;
  }

  setDescription (transactionId, description) {
    const params = { id: transactionId, description };
    const rowsUpdated = dbUtils.update(this.db, 'transactions', params);
    this._ensureRecordWasUpdated(rowsUpdated, transactionId);
    return this._findTransaction(transactionId);
  }

  _findTransaction (id) {
    return dbUtils.find(this.db, 'transactions', { id })
  }

  _ensureRecordWasUpdated (rowsUpdated, transactionId) {
    if (rowsUpdated.changes === 0) {
      throw new Error(`transaction with id ${transactionId} doesn't exist`)
    }
  }
}

module.exports = DescriptionSetService;
