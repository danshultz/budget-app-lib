const { expect } = require('chai');
const { noopLogger } = require('../support');
const db = require('../../lib/db');

const latestMigration = '7';
const createdTables = [
  'accounts',
  'budgets',
  'budget_entries', 'migrations',
  'transactions',
];

describe('migrating', function () {
  afterEach(function () {
    db.clearInstances();
  });

  it('migrates a new database', function () {
    let instance = db.getInstance(':memory:');

    return db.migrate(instance, noopLogger)
      .then(() => instance.get('SELECT migration from migrations order by migration DESC'))
      .then((result) => {
        expect(result).to.deep.equal({ migration: latestMigration });
      })
  });

  it('creates all the tables', function () {
    let instance = db.getInstance(':memory:');

    return db.migrate(instance, noopLogger)
      .then(() => instance.all('SELECT name FROM sqlite_master WHERE type=\'table\''))
      .then((result) => {
        let tableNames = result.map((r) => r.name);
        createdTables.forEach((table) => {
          expect(tableNames).to.include(table);
        });
      })
  });

  it('adds the categories JSON column properly', function () {
    let instance = db.getInstance(':memory:');

    return db.migrate(instance, noopLogger)
      .then(() => instance.all('PRAGMA table_info(transactions);'))
      .then((result) => {
        const column = result.find((d) => d.name === 'categories')
        expect(column).to.include({ type: 'JSON1', notnull: 1, dflt_value: "'[]'" })
      })
  });

});
