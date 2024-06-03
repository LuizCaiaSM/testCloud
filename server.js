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
app.get('/cadastro.html', (req, res) => {
    res.sendFile(path.join(__dirname, '/cadastro.html'));
});
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

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Email e senha são obrigatórios');
    }

    try {
        const connection = await connectToDatabase();
        const query = 'SELECT * FROM users WHERE email = ?';
        const [results] = await connection.execute(query, [email]);

        if (results.length === 0) {
            connection.end();
            return res.status(401).send('Email ou senha incorretos');
        }

        const user = results[0];
        const isPasswordCorrect = await bcrypt.compare(password, user.senha);

        connection.end();

        if (!isPasswordCorrect) {
            return res.status(401).send('Email ou senha incorretos');
        }

        res.status(200).json({ message: 'Login bem-sucedido', redirect: '/index2.html', nome: user.nome });
    } catch (err) {
        console.error('Erro ao consultar usuário:', err);
        res.status(500).send('Erro ao consultar usuário');
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
