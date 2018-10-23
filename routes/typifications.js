const auth = require('../middleware/auth');
const { Typifications, validateTypifications } = require('../models/typification');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Joi = require('joi'); //Validacion de Inputs en el servicio

/***************** */
/* TIPIFICACIONES */
/******************/

//'BUSCAR TIPIFICACIONES' GET Method
router.get('/', auth, async(req, res) => {
    const typifications = await Typifications.find().sort('name');
    res.send(typifications);
});

//'BUSCAR UNA TIPIFICACION ' GET Method
router.get('/:id', auth, async(req, res) => {
    try {
        //Buscar un  caso especifico
        //Si no existe, return 404 - Not Found
        const typification = await Typifications.findById(req.params.id);
        if (!typification) return res.status(404).send('Tipificación no encontrada'); // Error 404 
        res.send(typification);
    } catch (ex) {
        res.status(500).send('Algo salio mal :(')
    }
});

//'CREAR TIPIFICACIÓN' POST Method
router.post('/', auth, async(req, res) => {
    try
    {
        //Validate Data
        //If invalid, return 404 - Bad Request
        const { error } = validateTypifications(req.body);
        if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

        let typification = new Typifications({
            name: req.body.name
        });
        typification = await typification.save();
        res.send(typification);
    } 
    catch (ex) {
        console.log(ex);
        res.status(500).send({'Error': 'Algo salio mal :('})
    }
});

//'MODIFICAR TIPIFICACIÓN' PUT Method
router.put('/:id', auth, async(req, res) => {
    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validateTypifications(req.body);
    //if (error) return res.status(400).send(error.details[0].message);
    if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

    const typification = await Typifications.findByIdAndUpdate(req.params.id, {
        name: req.body.name
    }, {
        new: true
    });

    //If not existing, return 404 - Not Found
    if (!typification) return res.status(404).send('Tipificación no encontrado'); // Error 404 

    res.send(typification);
});


module.exports = router;