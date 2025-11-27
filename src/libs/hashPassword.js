const bcrypt = require('bcrypt');

const saltRounds = 10;

async function hashPassword(password) {
    const hashed = await bcrypt.hash(password, saltRounds);
    return hashed;
}

async function comparePassword(password, hashedPassword) {
    const match = await bcrypt.compare(password, hashedPassword);
    return match;
}

module.exports = {
    hashPassword,
    comparePassword
};
