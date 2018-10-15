var denodeify = require('../util/denodeify');
var fs = require('fs');
var _readFile = denodeify(fs.readFile);

let Parser = require('ofx-parser/lib/index.js').Parser;
let AccountImporter = require('./account-importer');
let TransactionImporter = require('./transaction-importer');

class OfxImporter {
  constructor (db) {
    this.db = db;
    this.accountImporter = new AccountImporter(db);
  }

  import (ofxFilePath) {
    return _readFile(ofxFilePath, 'utf-8')
      .then(this._parseOfxFile)
      .then(({ signOnInfo, account }) => this._importAccount({ signOnInfo, account }))
      .then(({ signOnInfo, account, accountRecord }) => {
        return this._importTransactions({ account, accountRecord })
      })
  }

  _parseOfxFile (ofxData) {
    let parser = new Parser(ofxData.toString());
    let result = parser.parse();
    let signOnInfo = result.signOn
    let account = result.accounts[0]
    return { signOnInfo, account };
  }

  _importAccount ({ signOnInfo, account }) {
    return this.accountImporter.import(signOnInfo, account)
      .then((accountRecord) => {
        return { signOnInfo, account, accountRecord }
      })
  }

  _importTransactions ({ account, accountRecord }) {
    let transactionImporter = new TransactionImporter(this.db, accountRecord.id);
    return transactionImporter.import(account.transactions, accountRecord.balance.amount)
      .then((transactionRecords) => {
        return { transactionRecords, accountRecord };
      })
  }
}


module.exports = OfxImporter;
