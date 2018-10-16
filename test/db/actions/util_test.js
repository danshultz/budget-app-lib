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

describe('db/action/utils', function () {
  beforeEach(function (done) {
    this.instance = db.getInstance(':memory:');
    this.instance.run(TEST_MIGRATION).then(() => done());
  });

  afterEach(function () {
    db.clearInstances();
  });

  describe('create', function () {
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
    let createdRecord;

    beforeEach(function (done) {
      let recordToCreate = { name: 'bob', number: '123' };

      dbUtils.insert(this.instance, 'persons', recordToCreate)
        .then((result) => {
          createdRecord = result;
          done();
        })
        .catch(done);
    });

    it('updates a created record', function (done) {
      let update = { id: createdRecord.id, name: 'jim' };

      dbUtils.update(this.instance, 'persons', update)
        .then((rowsChanged) => expect(rowsChanged).to.equal(1))
        .then(() => dbUtils.find(this.instance, 'persons', { id: createdRecord.id }))
        .then((result) => {
          expect(result).to.not.be.null;
          expect(result.name).to.equal('jim');
          done();
        })
        .catch(done);
    });
  })

  describe('findAll', function () {

    beforeEach(function () {
      let recordsToCreate = [
        { name: 'bob', number: '123' },
        { name: 'sam', number: '56' },
        { name: 'jill', number: '56' },
        { name: 'anna', number: '22' }
      ]

      let inserts = recordsToCreate.map((r) => dbUtils.insert(this.instance, 'persons', r))
      return Promise.all(inserts)
    });

    it('selects all the records', function () {
      return dbUtils.findAll(this.instance, 'persons', { number: 56 })
        .then((records) => {
          expect(records.length).to.equal(2);
          expect(records[0]).to.deep.contain({ name: 'sam', number: 56 })
          expect(records[1]).to.deep.contain({ name: 'jill', number: 56 })
        });
    })

    it('selects all the records and orders them', function () {
      return dbUtils.findAll(this.instance, 'persons', { number: 56 }, 'order by name')
        .then((records) => {
          expect(records.length).to.equal(2);
          expect(records[0]).to.deep.contain({ name: 'jill', number: 56 })
          expect(records[1]).to.deep.contain({ name: 'sam', number: 56 })
        });
    })

  })

});
