// workerModule fixture for the resolveOptions tier test: one shim export the
// test asserts resolves before the floor defaults.
exports.mkdir = function mkdir(path, callback) {
  callback(null);
};
