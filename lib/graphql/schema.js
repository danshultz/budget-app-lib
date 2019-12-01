const { makeExecutableSchema } = require('graphql-tools');
const Base = require('./base');
const Account = require('./resources/account/schema');
const resolvers = require('./resolvers');


module.exports = makeExecutableSchema({
    typeDefs: [Base, Account],
    resolvers,
    logger: { log: e => console.log(e) },
});
