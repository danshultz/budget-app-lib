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
  beforeEach(function () {
    this.instance = db.getInstance(':memory:');
    return this.instance.exec(TEST_MIGRATION)
  });

  afterEach(function () {
    return db.clearInstances();
  });

  describe('create', function () {
    it('creates a record', function () {
      let recordToCreate = { name: 'bob', number: '123' };
      let result = dbUtils.insert(this.instance, 'persons', recordToCreate)

      expect(result.id).to.equal(1);
      expect(result.name).to.equal('bob');
      expect(result.created_at).to.not.equal(null);
      expect(result.updated_at).to.not.equal(null);
    });
  });

  describe('findOrCreate', function () {
    it('creates a record', function () {
      let recordToCreate = { name: 'bob', number: '123' };

      var result = dbUtils.findOrCreate(this.instance, 'persons', recordToCreate, ['id'])
      expect(result.id).to.equal(1);
      expect(result.name).to.equal('bob');

      result = dbUtils.findOrCreate(this.instance, 'persons', recordToCreate, ['name'])
      expect(result.id).to.equal(1);
      expect(result.name).to.equal('bob');
    });
  });

  describe('update', function () {
    let createdRecord;

    beforeEach(function () {
      let recordToCreate = { name: 'bob', number: '123' };
      createdRecord = dbUtils.insert(this.instance, 'persons', recordToCreate)
    });

    it('updates a created record', function () {
      let update = { id: createdRecord.id, name: 'jim' };

      const result = dbUtils.update(this.instance, 'persons', update);
      expect(result.changes).to.equal(1)

      const updatedRecord = dbUtils.find(this.instance, 'persons', { id: createdRecord.id })
      expect(updatedRecord).to.not.be.null;
      expect(updatedRecord.name).to.equal('jim');
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

      return recordsToCreate.map((r) => dbUtils.insert(this.instance, 'persons', r))
    });

    it('selects all the records', function () {
      const records = dbUtils.findAll(this.instance, 'persons', { number: 56 })
      expect(records.length).to.equal(2);
      expect(records[0]).to.deep.contain({ name: 'sam', number: 56 })
      expect(records[1]).to.deep.contain({ name: 'jill', number: 56 })
    })

    it('selects all the records and orders them', function () {
      const records = dbUtils.findAll(this.instance, 'persons', { number: 56 }, 'order by name')
      expect(records.length).to.equal(2);
      expect(records[0]).to.deep.contain({ name: 'jill', number: 56 })
      expect(records[1]).to.deep.contain({ name: 'sam', number: 56 })
    })
  })

  describe('createOrUpdate', function () {
    let createdRecord;

    beforeEach(function () {
      let recordToCreate = { name: 'bob', number: '123' };
      createdRecord = dbUtils.insert(this.instance, 'persons', recordToCreate)
    });

    it('updates the record', function () {
      let update = { name: 'jim', number: '123' };

      const result = dbUtils.createOrUpdate(this.instance, 'persons', update, ['number']);
      expect(result.id).to.equal(1);
      expect(result.name).to.equal('jim');
      expect(result.number).to.equal('123');
    })

    it('it creates a record', function () {
      let update = { name: 'jill', number: '999' };

      const result = dbUtils.createOrUpdate(this.instance, 'persons', update, ['number']);
      expect(result.id).to.equal(2);
      expect(result.name).to.equal('jill');
      expect(result.number).to.equal('999');
    })
  })

});
