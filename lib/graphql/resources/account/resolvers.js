module.exports = {
  Query: {
    Accounts: (_, { limit = 5, skip = 0 }, context) =>
      Promise.resolve([
        { id: 1, name: "foo" },
        { id: 2, name: "foo2" }
      ]),
    Account: (_, { id }, context) => Promise.resolve({ id: 4, name: "bar" })
  }
};
