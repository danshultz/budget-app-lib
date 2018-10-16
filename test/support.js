const noop = function () { }

const noopLogger = {
  log: noop,
  debug: noop,
  warn: noop,
  error: noop
}

module.exports = {
  noopLogger
}
