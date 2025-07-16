const { encryptPassword, comparePassword, generateToken } = require('../utils/Utils');
const { runQuery, runQueryOne } = require('./BaseService');

async function loginUser({ user_email, user_pass }) {
    const user = await runQueryOne('SELECT * FROM ecommerce_user WHERE user_email = $1', [user_email]);
    if (!user) return null;

    const passValid = await comparePassword(user_pass, user.user_pass);
    if(!passValid) return null;

    delete user.user_pass;

    const token = generateToken({
        user_id: user.user_id,
        user_email: user.user_email,
        user_role: user.user_role
    });

    return {
        user, token
    };
}

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

module.exports = { loginUser, getAllUser, getUserByID, postUser }