const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const Joi = require('joi'); //Validacion de Inputs en el servicio

//'CREAR TIPIFICACIÓN' POST Method
router.post('/', auth, async (req, res) => {
    res.send(req.body);
});

module.exports = router;