const extend = function (toCopy, ...args) {
  args.forEach((fromCopy) => {
    Object.keys(fromCopy).forEach((key) => toCopy[key] = fromCopy[key]);
  })

  return toCopy;
}

module.exports = extend;
