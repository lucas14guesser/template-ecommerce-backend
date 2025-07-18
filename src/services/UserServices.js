const { encryptPassword, comparePassword, generateToken } = require('../utils/Utils');
const { runQuery, runQueryOne } = require('./BaseService');

async function loginUser({ user_email, user_pass }) {
    const user = await runQueryOne('SELECT * FROM ecommerce_user WHERE user_email = $1', [user_email]);
    if (!user) {
        return { error: 'Você não possui uma conta cadastrada'}
    };

    const passValid = await comparePassword(user_pass, user.user_pass);
    if(!passValid) {
        return { error: 'Credenciais inválidas.'}
    };

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
        return { error: 'Todos os campos precisam ser preenchidos' };
    }

    const existingUser = await runQueryOne('SELECT * FROM ecommerce_user WHERE user_email = $1', [user_email]);
    if (existingUser) {
        return { error: 'E-mail já cadastrado' };
    }
    
    const hashedPass = await encryptPassword(user_pass)
    return runQuery('INSERT INTO ecommerce_user (user_nome, user_email, user_pass) VALUES ($1, $2, $3)', [user_nome, user_email, hashedPass]);
}

async function EditUserByID(user_id, user_nome, user_endereco, user_telefone, user_cpf) {
    return runQueryOne('UPDATE ecommerce_user SET user_nome = $1, user_endereco = $2, user_telefone = $3, user_cpf = $4 WHERE user_id = $5 RETURNING *', [user_nome, user_endereco, user_telefone, user_cpf, user_id]);
}

module.exports = { loginUser, getAllUser, getUserByID, postUser, EditUserByID }