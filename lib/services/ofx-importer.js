var fs = require('fs');
var _readFile = fs.readFileSync;

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
    const ofxData = _readFile(ofxFilePath, 'utf-8')
    const { signOnInfo, account } = this._parseOfxFile(ofxData);
    const accountRecord = this._importAccount({ signOnInfo, account });
    const transactionRecords = this._importTransactions({ account, accountRecord });

    return { accountRecord, transactionRecords };
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
    return this.accountImporter.import(signOnInfo, account);
  }

  _importTransactions ({ account, accountRecord }) {
    this.logger.log('importing transactions');
    let transactionImporter = new TransactionImporter(this.db, accountRecord.id);
    return transactionImporter.import(account.transactions, accountRecord.balance);
  }
}


module.exports = OfxImporter;
