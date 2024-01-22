const { getInstance, clearInstances } = require('./database-instance');

function maybeRunMigration (db, m, logger) {
  try {
    const statement = db.prepare('SELECT * FROM migrations WHERE migration = @migration');
    const result = statement.get({ migration: m.id.toString() });
    if (!result) {
      runMigration(db, m, logger);
    }
  } catch(err) {
    logger.log(`Failed to run migration ${m.id} with error, ${err}`);
  }
};

function runMigration (db, m, logger) {
  m.migrate(db)
  const statement = db.prepare('INSERT INTO migrations (migration) VALUES (@migration)');
  const result = statement.run({ migration: m.id.toString() });
  logger.log('Completed migration ', m.id);
}

function migrateEach (db, migrations, logger) {
  return migrations.forEach((migration) => {
    return maybeRunMigration(db, migration, logger);
  })
}

module.exports = {
  getInstance (path=':memory:') {
    return getInstance(path);
  },

  migrate (db, logger=console) {
    db.exec('CREATE TABLE IF NOT EXISTS migrations (migration TEXT, PRIMARY KEY(migration))');
    var migrations = require('./migrations');
    return migrateEach(db, migrations, logger);
  },

  clearInstances
};
