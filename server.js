const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const dbConfig = {
    user: 'projetobelle2',
    password: 'JuniorPVP2#',
    server: 'projetobelle2.mysql.database.azure.com',
    database: 'cadastrologin',
    options: {
        encrypt: true,
        enableArithAbort: true
    }
};

async function connectToDatabase() {
    try {
        await sql.connect(dbConfig);
        console.log('Conectado ao banco de dados SQL Server.');
    } catch (err) {
        console.error('Erro ao conectar ao banco de dados SQL Server:', err);
    }
}

connectToDatabase();

app.get('/cadastro', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request().query('SELECT * FROM users');

        res.json(result.recordset);
    } catch (err) {
        console.error('Erro ao buscar cadastros:', err);
        res.status(500).send('Erro ao buscar cadastros');
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
