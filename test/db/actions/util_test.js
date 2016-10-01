const { expect } = require('chai');

const db = require('../../../lib/db');
const dbUtils = require('../../../lib/db/actions/util');

const TEST_MIGRATION = `
CREATE TABLE persons (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  name VARCHAR(255) NOT NULL,
  number INTEGER,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
)
`

describe('create', function () {
  beforeEach(function (done) {
    this.instance = db.getInstance(':memory:');
    this.instance.run(TEST_MIGRATION).then(() => done());
  });

  afterEach(function () {
    db.clearInstances();
  });

  it('creates a record', function (done) {
    let recordToCreate = { name: 'bob', number: '123' };
    dbUtils.insert(this.instance, 'persons', recordToCreate)
      .then((result) => {
        expect(result.id).to.equal(1);
        expect(result.name).to.equal('bob');
        expect(result.created_at).to.not.equal(null);
        expect(result.updated_at).to.not.equal(null);
        done();
      })
      .catch(done);
  });
});

describe('findOrCreate', function () {
  beforeEach(function (done) {
    this.instance = db.getInstance(':memory:');
    this.instance.run(TEST_MIGRATION).then(() => done());
  });

  afterEach(function () {
    db.clearInstances();
  });

  it('creates a record', function (done) {
    let recordToCreate = { name: 'bob', number: '123' };

    dbUtils.findOrCreate(this.instance, 'persons', recordToCreate, ['id'])
      .then((result) => {
        expect(result.id).to.equal(1);
        expect(result.name).to.equal('bob');
      })
      .then(() => dbUtils.findOrCreate(this.instance, 'persons', recordToCreate, ['name']))
      .then((result) => {
        expect(result.id).to.equal(1);
        expect(result.name).to.equal('bob');
        done();
      })
      .catch(done);
  });
});

describe('update', function () {
})
