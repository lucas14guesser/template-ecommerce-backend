const { connectDB } = require("../db");
const bcrypt = require('bcrypt');
const saltRounds = 10;

async function getDB() {
    const db = await connectDB();
    return db;
}

function createSuccess(result = []) {
    return { error: '', result }
}

function createError(errorMsg = '') {
    return { error: errorMsg, result: [] }
}

async function encryptPassword(pass) {
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(pass, salt);
}

module.exports = { getDB, createSuccess, createError, encryptPassword };