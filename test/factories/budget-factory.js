const dbUtils = require('../../lib/db/actions/util');
const defaultCategory = { categoryId: 12, amount: 5000 };

function createCategories (db, budgetRecord, categories) {
  const categoryInserts = categories.map((c) => dbUtils.insert(
    db,
    'budget_entries',
    {
      budget_id: budgetRecord.id,
      transaction_category_id: c.categoryId,
      amount: c.amount
    }
  ));

  return Promise.all(categoryInserts);
}

function create (db, {
  year=2018,
  month=11,
  totalIncome=12300,
  categories=[defaultCategory]
}={}) {
  return dbUtils.insert(db, 'budgets', { year, month, total_income: totalIncome })
    .then((budgetRecord) =>
      createCategories(db, budgetRecord, categories).then(() => budgetRecord)
    );
}

module.exports = {
  create
}
