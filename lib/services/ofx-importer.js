var denodeify = require('../util/denodeify');
var fs = require('fs');
var _readFile = denodeify(fs.readFile);

let Parser = require('ofx-parser/lib/index.js').Parser;
let AccountImporter = require('./account-importer');
let TransactionImporter = require('./transaction-importer');

class OfxImporter {
  constructor (db, logger=console) {
    this.db = db;
    this.accountImporter = new AccountImporter(db);
    this.logger = logger;
  }

  import (ofxFilePath) {
    return _readFile(ofxFilePath, 'utf-8')
      .then((ofxData) => this._parseOfxFile(ofxData))
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
    this.logger.log('parsed ofx file');
    return { signOnInfo, account };
  }

  _importAccount ({ signOnInfo, account }) {
    this.logger.log('importing accounts');
    return this.accountImporter.import(signOnInfo, account)
      .then((accountRecord) => {
        return { signOnInfo, account, accountRecord }
      })
  }

  _importTransactions ({ account, accountRecord }) {
    this.logger.log('importing transactions');
    let transactionImporter = new TransactionImporter(this.db, accountRecord.id);
    return transactionImporter.import(account.transactions, accountRecord.balance)
      .then((transactionRecords) => {
        return { transactionRecords, accountRecord };
      })
  }
}


module.exports = OfxImporter;
