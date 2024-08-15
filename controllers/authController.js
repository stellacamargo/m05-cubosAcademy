const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const redefinirSenha = async (req, res) => {
    const { email, senha_antiga, senha_nova } = req.body;

    if (!email || !senha_antiga || !senha_nova) {
        return res.status(400).json({ error: 'Email, senha antiga e senha nova são obrigatórios.' });
    }

    if (senha_antiga === senha_nova) {
        return res.status(400).json({ error: 'A senha nova não pode ser igual à senha antiga.' });
    }

    try {
        const { rows } = await req.pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Email ou senha incorretos.' });
        }

        const usuario = rows[0];
        const senhaCorreta = await bcrypt.compare(senha_antiga, usuario.senha);

        if (!senhaCorreta) {
            return res.status(401).json({ error: 'Email ou senha incorretos.' });
        }

        const hashedPassword = await bcrypt.hash(senha_nova, 10);

        await req.pool.query('UPDATE usuarios SET senha = $1 WHERE email = $2', [hashedPassword, email]);

    

        res.status(200).json({ message: 'Senha alterada com sucesso.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao redefinir senha.' });
    }
};

module.exports = { redefinirSenha };
