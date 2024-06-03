const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
};

let connection;

async function connectToDatabase() {
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Conectado ao banco de dados MySQL.');
    } catch (err) {
        console.error('Erro ao conectar ao banco de dados MySQL:', err);
    }
}

connectToDatabase();

app.use(express.static(path.join(__dirname, 'public')));

app.post('/cadastro', async (req, res) => {
    console.log('Recebida requisição de cadastro:', req.body);
    const { nome, email, password } = req.body;

    if (!nome || !email || !password) {
        console.log('Nome, email ou senha não fornecidos');
        return res.status(400).send('Nome, email e senha são obrigatórios');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)';
        const [results] = await connection.execute(query, [nome, email, hashedPassword]);
        console.log('Usuário cadastrado com sucesso:', results);
        res.status(201).send('Usuário cadastrado com sucesso');
    } catch (err) {
        console.error('Erro ao cadastrar usuário:', err);
        res.status(500).send('Erro ao cadastrar usuário');
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Email e senha são obrigatórios');
    }

    try {
        const query = 'SELECT * FROM users WHERE email = ?';
        const [results] = await connection.execute(query, [email]);

        if (results.length === 0) {
            return res.status(401).send('Email ou senha incorretos');
        }

        const user = results[0];
        const isPasswordCorrect = await bcrypt.compare(password, user.senha);

        if (!isPasswordCorrect) {
            return res.status(401).send('Email ou senha incorretos');
        }

        res.status(200).json({ message: 'Login bem-sucedido', redirect: '/index2.html', nome: user.nome });
    } catch (err) {
        console.error('Erro ao consultar usuário:', err);
        res.status(500).send('Erro ao consultar usuário');
    }
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
