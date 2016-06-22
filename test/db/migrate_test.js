const { expect } = require('chai');
const db = require('../../lib/db');

const latestMigration = '1';
const createdTables = ['migrations', 'accounts', 'transactions'];

describe('migrating', function () {
  afterEach(function () {
    db.clearInstances();
  });

  it('migrates a new database', function (done) {
    let instance = db.getInstance(':memory:');

    db.migrate(instance)
      .then(() => instance.get('SELECT migration from migrations order by migration DESC'))
      .then((result) => {
        expect(result).to.deep.equal({ migration: latestMigration });
        done();
      })
      .catch(done);
  });

  it('creates all the tables', function (done) {
    let instance = db.getInstance(':memory:');

    db.migrate(instance)
      .then(() => instance.all('SELECT name FROM sqlite_master WHERE type=\'table\''))
      .then((result) => {
        let tableNames = result.map((r) => r.name);
        createdTables.forEach((table) => {
          expect(tableNames).to.include(table);
        });
        done();
      })
      .catch(done);

  });

});
