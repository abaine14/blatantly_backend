const NodeCache = require("node-cache");
const acountRequestCache = new NodeCache();

// unset after success/cancellation/login
exports.setAccountLoading = (uid) => {
  acountRequestCache.set(uid);
};

exports.checkIfAccountIsLoading = (uid) => {
  return acountRequestCache.has(uid);
};

exports.removeLoadedAccount = (uid) => {
  acountRequestCache.del(uid);
};
