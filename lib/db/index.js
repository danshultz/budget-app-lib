const { getInstance, clearInstances } = require('./database-instance');

function maybeRunMigration (db, m, logger) {
  return db.get('SELECT * FROM migrations WHERE migration = ?', [m.id])
    .then((result) => { return result ? Promise.resolve() : runMigration(db, m, logger); })
    .catch((err) => logger.log(`Failed to run migration ${m.id} with error, ${err}`))
};

function runMigration (db, m, logger) {
  return m.migrate(db)
    .then(() => db.run('INSERT INTO migrations (migration) VALUES (?)', [m.id]))
    .then(() => logger.log('Completed migration ', m.id));
}

function migrateEach (db, migrations, logger) {
  return migrations.reduce((lastMigration, migration) => {
    return lastMigration.then(() => maybeRunMigration(db, migration, logger));
  }, Promise.resolve());
}

module.exports = {
  getInstance (path=':memory:') {
    return getInstance(path);
  },

  migrate (db, logger=console) {
    return db.run('CREATE TABLE IF NOT EXISTS migrations (migration TEXT, PRIMARY KEY(migration))')
      .then(() => {
        var migrations = require('./migrations');
        return migrateEach(db, migrations, logger);
      });
  },

  clearInstances
};
