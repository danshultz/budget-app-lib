const dbUtils = require('../../../db/actions/util');

module.exports = {
  Query: {
    Accounts: (_, {}, context) => context.db.all('SELECT * FROM accounts'),
    Account: (_, { id }, context) => dbUtils.find(context.db, 'accounts', { id })
  }
};
