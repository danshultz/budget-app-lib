module.exports = {
  db: require('./lib/db'),
  services: {
    TransactionImporter: require('./lib/services/transaction-importer'),
    AccountImporter: require('./lib/services/account-importer')
  }
};
