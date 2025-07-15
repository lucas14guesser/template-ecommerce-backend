const { encryptPassword } = require('../utils/Utils');
const { runQuery, runQueryOne } = require('./BaseService');

async function getAllUser() {
    return runQuery('SELECT * FROM ecommerce_user', []);
}

async function getUserByID(user_id) {
    return runQueryOne('SELECT * from ecommerce_user WHERE user_id = $1', [user_id]);
}

async function postUser({ user_nome, user_email, user_pass }) {
    if (!user_nome || !user_email || !user_pass) {
        return null;
    }
    
    const hashedPass = await encryptPassword(user_pass)
    return runQuery('INSERT INTO ecommerce_user (user_nome, user_email, user_pass) VALUES ($1, $2, $3)', [user_nome, user_email, hashedPass]);
}

module.exports = { getAllUser, getUserByID, postUser }