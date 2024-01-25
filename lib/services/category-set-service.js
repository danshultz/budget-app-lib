const dbUtils = require('../db/actions/util');

class CategorySetService {
  constructor (db) {
    this.db = db;
  }

  // Categories are expected to be...
  // [{ key: 'category_key', amount: <in pennies> }]
  setCategories (transactionId, categories) {
    // query transaction
    // check that categories total up to transaction total
    // ensure unique category keys
    // record the categories
    let transactionRecord = this._findTransaction(transactionId)
    this._ensureTransactionRecord(transactionId, transactionRecord);
    this._updateCategories(transactionRecord, categories);
    transactionRecord = this._findTransaction(transactionId);
    return this._deserializeCategories(transactionRecord);
  }

  _findTransaction (id) {
    return dbUtils.find(this.db, 'transactions', { id })
  }

  _updateCategories (transactionRecord, categories) {
    this._ensureCategoriesEqualAmount(transactionRecord.amount, categories);

    const id = transactionRecord.id;
    const categoriesJson = JSON.stringify(categories);
    return dbUtils.update(this.db, 'transactions', { id, categories: categoriesJson });
  }

  _ensureTransactionRecord (transactionId, transactionRecord) {
    if (!transactionRecord) {
      throw new Error(`transaction with id ${transactionId} doesn't exist`)
    }
  }

  _ensureCategoriesEqualAmount (amount, categories) {
    const categoriesSum = categories.reduce((sum, c) => sum + c.amount, 0)
    if (categoriesSum != amount) {
      throw new Error(`categories sum ${categoriesSum} must add up to transaction amount of ${amount}`);
    }
  }

  _deserializeCategories (transactionRecord) {
    transactionRecord.categories = JSON.parse(transactionRecord.categories);
    return transactionRecord;
  }
}

module.exports = CategorySetService;
