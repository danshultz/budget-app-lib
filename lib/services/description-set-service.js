const dbUtils = require('../db/actions/util');

class DescriptionSetService {
  constructor (db) {
    this.db = db;
  }

  setDescription (transactionId, description) {
    const params = { id: transactionId, description };
    return dbUtils.update(this.db, 'transactions', params)
      .then((rowsUpdated) => this._ensureRecordWasUpdated(rowsUpdated, transactionId))
      .then(() => this._findTransaction(transactionId))
  }

  _findTransaction (id) {
    return dbUtils.find(this.db, 'transactions', { id })
  }

  _ensureRecordWasUpdated (rowsUpdated, transactionId) {
    if (rowsUpdated === 0) {
      throw new Error(`transaction with id ${transactionId} doesn't exist`)
    }
  }
}

module.exports = DescriptionSetService;
