const bcrypt = require('bcrypt');

const hash = async (value, saltRounds = 10) => bcrypt.hash(value, saltRounds);
const compare = async (value, hashedValue) => bcrypt.compare(value, hashedValue).catch(() => false);

module.exports = { hash, compare };
