const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const cadastrarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
    }

    try {
        const { rows: emailExistente } = await req.pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (emailExistente.length > 0) {
            return res.status(400).json({ error: 'O e-mail já está em uso.' });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);

        const { rows: novoUsuario } = await req.pool.query(
            'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING *',
            [nome, email, hashedPassword]
        );

        res.status(201).json({
            message: 'Usuário cadastrado com sucesso.',
            usuario: novoUsuario[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao cadastrar o usuário.' });
    }
};

const loginUsuario = async (req, res) => {
    const { email, senha } = req.body;

    
    if (!email || !senha) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    try {
        
        const { rows: usuarios } = await req.pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (usuarios.length === 0) {
            return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
        }

        const usuario = usuarios[0];

        
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (!senhaCorreta) {
            return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
        }

       
        const token = jwt.sign(
            {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                admin: usuario.admin
            },
            process.env.JWT_SECRET, 
            {
                expiresIn: '24h' 
            }
        );

        return res.status(200).json({
            message: 'Login realizado com sucesso.',
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                admin: usuario.admin
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao realizar o login.' });
    }
};

const detalharPerfil = async (req, res) => {
    try {
        const { rows: usuario } = await req.pool.query('SELECT * FROM usuarios WHERE id = $1', [req.userId]);

        if (usuario.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        res.status(200).json(usuario[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar perfil do usuário.' });
    }
};

const editarPerfil = async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email) {
        return res.status(400).json({ error: 'Nome e email são obrigatórios.' });
    }

    try {
        const { rows: emailExistente } = await req.pool.query('SELECT * FROM usuarios WHERE email = $1 AND id != $2', [email, req.userId]);

        if (emailExistente.length > 0) {
            return res.status(400).json({ error: 'O e-mail já está em uso.' });
        }

        const hashedPassword = senha ? await bcrypt.hash(senha, 10) : undefined;

        await req.pool.query(
            'UPDATE usuarios SET nome = $1, email = $2, senha = COALESCE($3, senha) WHERE id = $4',
            [nome, email, hashedPassword, req.userId]
        );

        res.status(200).json({ message: 'Perfil atualizado com sucesso.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar perfil do usuário.' });
    }
};

module.exports = { cadastrarUsuario, loginUsuario, detalharPerfil, editarPerfil };
