const { expect } = require('chai');
const db = require('../../lib/db');

const latestMigration = '1';

describe('migrating', function () {
  it('migrates a new database', function (done) {
    let instance = db.getInstance(':memory:');

    db.migrate(instance)
      .then(() => instance.get('SELECT migration from migrations order by migration DESC limit 1'))
      .then((result) => {
        expect(result).to.deep.equal({ migration: latestMigration });
        done();
      })
      .catch(done);
  });

});
