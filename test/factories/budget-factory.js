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

  return categoryInserts;
}

function create (db, {
  year=2018,
  month=11,
  totalIncome=12300,
  categories=[defaultCategory]
}={}) {
  const budgetRecord = dbUtils.insert(db, 'budgets', { year, month, total_income: totalIncome })
  createCategories(db, budgetRecord, categories);
  return budgetRecord;
}

module.exports = {
  create
}
