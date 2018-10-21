const jwt = require('jsonwebtoken');
const config = require('config');

function auth (req, res, next) {
    const token = req.header('x-auth-toke');
    if (!token) return res.status(401).send('Acceso Denegado. Token no enviado.')

    try {
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
        req.user = decoded;
        next();
    }

    catch(ex){
        res.status(400).send('Token Invalido');
    }
}

module.exports = auth;