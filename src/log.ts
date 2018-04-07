var DEBUG = false;

export function toggleDebug() {
  DEBUG = !DEBUG;
};

export function error(...args) {
  _log("error", ...args);
}

export function log(...args) {
  _log("log", ...args);
}

function _log(type, ...args) {
  if (!DEBUG) return;
  console[type](...args);
}