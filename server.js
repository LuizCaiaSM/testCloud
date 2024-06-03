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

app.post('/cadastro', async (req, res) => {
    const { nome, email, password } = req.body;

    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request()
            .input('nome', sql.NVarChar, nome)
            .input('email', sql.NVarChar, email)
            .input('password', sql.NVarChar, password)
            .query('INSERT INTO users (nome, email, senha) VALUES (@nome, @email, @password)');

        res.send('Cadastro realizado com sucesso!');
    } catch (err) {
        console.error('Erro ao cadastrar:', err);
        res.status(500).send('Erro ao cadastrar');
    }
});
