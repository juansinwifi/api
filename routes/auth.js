const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const {Users} = require('../models/user');
const Joi = require('joi'); //Validacion de Inputs en el servicio
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
/******************************/
/* Autenticación de Usuarios */
/****************************/

router.post('/', async (req, res) => {
   //If invalid, return 404 - Bad Request
   const { error } = validate(req.body);
   if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);
   
   //Buscamos el Usuario
   let user = await Users.findOne({ user: req.body.user});
   if (!user) return res.status(400).send('Usuario o Contraseña invalido');
   if (!user.active) return res.status(400).send('El usuario no se encuentra activo.');
   const validPassword = await bcrypt.compare(req.body.password, user.password);
   if (!validPassword) return res.status(400).send('Usuario o Contraseña invalido');

    const token = user.generateAuthToken();
    const access = { "token": token };
    res.send(access);
});

//Funcion de Validación de Campos de Usuario
function validate(req) {

    const schema = {
        user: Joi.string().min(3).required(),
        password: Joi.string().min(6).required()
    };

    return Joi.validate(req, schema);
}

module.exports = router;