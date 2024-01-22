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

    db.migrate(instance, noopLogger);
    const statement = instance.prepare('SELECT migration from migrations order by migration DESC');
    const result = statement.get();
    expect(result).to.deep.equal({ migration: latestMigration });
  });

  it('creates all the tables', function () {
    let instance = db.getInstance(':memory:');

    db.migrate(instance, noopLogger)
    const statement = instance.prepare('SELECT name FROM sqlite_master WHERE type=\'table\'');
    const result = statement.all();

    const tableNames = result.map((r) => r.name);
    createdTables.forEach((table) => {
      expect(tableNames).to.include(table);
    });
  });

  it('adds the categories JSON column properly', function () {
    let instance = db.getInstance(':memory:');

    db.migrate(instance, noopLogger)
    const statement = instance.prepare('PRAGMA table_info(transactions);');
    const result = statement.all();
    const column = result.find((d) => d.name === 'categories')
    expect(column).to.include({ type: 'JSON1', notnull: 1, dflt_value: "'[]'" })
  });

});
