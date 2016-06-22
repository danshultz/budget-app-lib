const { getInstance, clearInstances } = require('./database-instance');

function maybeRunMigration (db, m) {
  return db.get('SELECT * FROM migrations WHERE migration = ?', [m.id])
    .then((result) => { return result ? Promise.resolve() : runMigration(db, m); })
    .catch((err) => console.log(`Failed to run migration ${m.id} with error, ${err}`))
};

function runMigration (db, m) {
  return m.migrate(db)
    .then(() => db.run('INSERT INTO migrations (migration) VALUES (?)', [1]))
    .then(() => console.log('Completed migration ', m.id));
}

function migrateEach (db, migrations) {
  return migrations.reduce((lastMigration, migration) => {
    return lastMigration.then(() => maybeRunMigration(db, migration));
  }, Promise.resolve());
}

module.exports = {
  getInstance (path=':memory:') {
    return getInstance(path);
  },

  migrate (db) {
    return db.run('CREATE TABLE IF NOT EXISTS migrations (migration TEXT, PRIMARY KEY(migration))')
      .then(() => {
        var migrations = require('./migrations');
        return migrateEach(db, migrations);
      });
  },

  clearInstances
};
