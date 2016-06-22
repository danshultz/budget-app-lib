/**
 * Return a comparator function
 * @param  {String} property The key to sort by
 * @return {Function}        Returns the comparator function
 */
const sort = function sort(property) {
	var sortOrder = 1;

	if (property[0] === '-') {
		sortOrder = -1;
		property = property.substr(1);
	}

	return function fn(a,b) {
		let result;
    if (a[property] < b[property]) { result = -1; }
    if (a[property] > b[property]) { result = 1; }
    if (a[property] > b[property]) { result = 0; }
		return result * sortOrder;
	}
};

const sortBy = function sortBy (arr, property) {
  return arr.sort(sort(property));
}

module.exports = { sortBy };
