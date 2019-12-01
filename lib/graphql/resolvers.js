const Account = require('./resources/account/resolvers');
const Date = require('./resources/scalar/Date');

module.exports = {
    Query: Object.assign({},
      Account.Query
    ),
    Mutation: {
    },
    Date,
};
