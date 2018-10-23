const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();


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