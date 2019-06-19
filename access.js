const {
  KEYS = '',
  NODE_ENV
} = process.env;

const keys = KEYS.split('|');

function hasAccess (key) {
  if (NODE_ENV !== 'production') {
    return true;
  }

  if (!key) {
    return false;
  }

  return keys.indexOf(key) >= 0;
}

module.exports = {
  hasAccess
}