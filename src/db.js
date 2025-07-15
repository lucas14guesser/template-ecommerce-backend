const { Pool } = require('pg');

async function connectDB() {
    if (global.connection) {
        return global.connection;
    }

    const pool = new Pool({
        connectionString: process.env.CONNECTION_STRING
    });

    try {
        const client = await pool.connect();
        console.log("✅ Conectado ao PostgreSQL!");

        client.release();

        global.connection = pool;
        return pool;
    } catch (error) {
        console.error("Erro ao conectar no PostgreSQL:", error);
        throw error;
    }
}

module.exports = { connectDB };
