const { connectDB } = require("../db");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;
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

function generateToken(payload, expiresIn = '2h') {
    return jwt.sign(payload, SECRET, { expiresIn });
}

async function verifyToken(token) {
    try {
        return jwt.verify(token, SECRET);
    } catch (error) {
        return null
    }
}

async function encryptPassword(pass) {
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(pass, salt);
}

async function comparePassword(pass, hash) {
    return await bcrypt.compare(pass, hash);
}

module.exports = { getDB, createSuccess, createError, generateToken, verifyToken, encryptPassword, comparePassword };