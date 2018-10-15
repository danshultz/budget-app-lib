const { expect } = require('chai');
var path = require('path');
const db = require('../../lib/db');
const OfxImporter = require('../../lib/services/ofx-importer');

var FIXTURE_FILE = path.join(__dirname, '../fixtures/test1.ofx');

describe('importing an ofx file', function () {
  beforeEach(function (done) {
    let instance = this.instance = db.getInstance(':memory:');
    db.migrate(instance).then(done).catch(done);
  });

  afterEach(function () {
    db.clearInstances();
  });

  it('returns the ofx file that it loaded', function (done) {
    ofxImporter = new OfxImporter(this.instance);
    ofxImporter.import(FIXTURE_FILE)
      .then((data) => {
        console.log(data);
        done()
      })
      .catch(done);
  })

})
