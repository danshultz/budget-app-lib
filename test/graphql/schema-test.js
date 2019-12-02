const { expect } = require('chai');
const { graphql } = require('graphql');

const db = require('../../lib/db');
const dbUtils = require('../../lib/db/actions/util');
const schema = require('../../lib/graphql/schema');
const { noopLogger } = require('../support');

const ACCOUNT_DATA = [{
  id: 1,
  name: 'FOO BANK',
  account_type: 'CHECKING',
  account_id: '123456',
  bank_id: '000000123',
  balance: 947148,
  balance_posted_at: '2018-10-15 12:00:00',
  created_at: '1540650959596'
}, {
  id: 2,
  name: 'Test Bank',
  account_type: 'CHECKING',
  account_id: '1234567',
  bank_id: '0000001234',
  balance: 556,
  balance_posted_at: '2018-10-18 12:00:00',
  created_at: '1540650959596'
}];

function executeGraphQl(query = null) {
  query = query || this.test.title;
  const context = { db: this.instance };
  return graphql(schema, query, null, context)
}

describe('GraphQL Schema', function () {
  beforeEach(function () {
    const instance = this.instance = db.getInstance(':memory:');
    return db.migrate(instance, noopLogger)
      .then(() => dbUtils.insertAll(instance, 'accounts', ACCOUNT_DATA))
  });

  afterEach(function () {
    return db.clearInstances();
  });

  it('{ Accounts { id name created_at } }', function () {
    return executeGraphQl.call(this).then(results => {
      expect(results.data).to.deep.equal({
        Accounts: [
          { id: '1', name: 'FOO BANK', created_at: '2018-10-27T14:35:59.596Z' },
          { id: '2', name: 'Test Bank', created_at: '2018-10-27T14:35:59.596Z' }
        ]
      })
    })
  });

  it('{ Account(id: 2) { id name balance } }', function () {
    return executeGraphQl.call(this).then(results => {
      expect(results.data).to.deep.equal({
        Account: {
          id: '2',
          name: 'Test Bank',
          balance: 556
        }
      });
    })
  });
});
