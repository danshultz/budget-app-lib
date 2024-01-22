const MIGRATION = `
ALTER TABLE accounts
ADD COLUMN display_name VARCHAR(255);
`;

module.exports = {
  id: 4,
  migrate (db) { return db.exec(MIGRATION); }
}
