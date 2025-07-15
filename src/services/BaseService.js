const { getDB } = require("../utils/Utils");

async function runQuery(queryText, params =[]) {
    try {
        const db = await getDB();
        const result = await db.query(queryText, params);
        return result.rows;
    } catch (error) {
        console.error("Erro ao executar query", error);
        return []
    }
}

async function runQueryOne(queryText, params = []) {
    try {
        const db = await getDB();
        const result = await db.query(queryText, params);
        return result.rows[0] || null;
    } catch (error) {
        console.error("Erro ao executar queryOne:", error);
        return null;
    }
}

module.exports = { runQuery, runQueryOne };