const Base = require('../../base');

const Account = `
extend type Query {
    Account(id: ID!): Account
    Accounts: [Account]
}

type Account {
    id: ID!
    name: String!
    account_type: String!
    account_id: String
    bank_id: String
    balance: Int
    display_name: String
    created_at: Date
    updated_at: Date
}
`;

module.exports = () => [Account, Base];

