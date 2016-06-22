const { sortBy } = require('../../util/sort');
var migrations = [];

require('fs').readdirSync(__dirname).forEach(function(file) {
  if (file !== 'index.js') {
    var migration = require('./' + file);
    migrations.push(migration);
  }
});

module.exports = sortBy(migrations, 'id');
