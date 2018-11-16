const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();

const varTypes = [
    { id: 1, name: 'Texto', type: 'string' },
    { id: 2, name: 'Numero', type: 'number' },
    { id: 3, name: 'Moneda', type: 'number' },
    { id: 4, name: 'Fecha', type: 'date' },
    { id: 5, name: 'Lista', type: 'array' }
];

//'BUSCAR TIPOS DE VARIABLES' GET Method
router.get('/', auth, (req, res) => {
    res.send(varTypes);
});

//'BUSCAR UNA TIPO DE VARIABLE' GET Method
router.get('/:id', auth, (req, res) => {
    //Look up the varTypes
    //If not existing, return 404 - Not Found
    const varType = varTypes.find(v => v.id === parseInt(req.params.id));
    if (!varType) return res.status(404).send('Tipo de Variable no encontrada'); // Error 404 
    res.send(varType);
});

module.exports = router;