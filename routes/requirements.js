
const auth = require('../middleware/auth');
const {Requirements, validate} = require('../models/requirements');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Joi = require('joi'); //Validacion de Inputs en el servicio

/**************** */
/* REQUERIMIENTOS */
/******************/

//'BUSCAR REQUERIMIENTOS' GET Method
router.get('/', auth, async (req, res) => {
    const requirements = await Requirements.find().sort('name');
    res.send(requirements);
});

//'BUSCAR UN REQUERIMIENTO ESPECIFICO' GET Method
router.get('/:id', auth, async (req, res) => {
    try{
        //Buscar un  caso especifico
        //Si no existe, return 404 - Not Found
        const requirements = await Requirements.findById(req.params.id);
        if (!requirements) return res.status(404).send('Requerimiento no encontrado'); // Error 404 
        res.send(requirements);
    }
    catch (ex){
        res.status(500).send({'Error': 'Algo salio mal :('})
    }
});

//'CREAR REQUERIMIENTO' POST Method  
router.post('/', auth, async (req, res) => {
    
    try{//Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validate(req.body);
    if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

    let requirements = new Requirements({
        type: req.body.type,
        sms: req.body.sms,
        written: req.body.written,
        medium: req.body.medium,
        times: req.body.times,
        days: req.body.days,
        hours: req.body.hours,
        trackingDate: req.body.trackingDate
    });
    requirements = await requirements.save();
    res.send(requirements);}
    catch(ex){
        res.status(500).send( ex )
    }
});

//'MODIFICAR REQUERIMIENTO' PUT Method   
router.put('/:id', auth, async (req, res) => {
    //Look up the requierement

    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validate(req.body);
    //if (error) return res.status(400).send(error.details[0].message);
    if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

   const requirements = await Requirements.findByIdAndUpdate(req.params.id, {
        type: req.body.type,
        sms: req.body.sms,
        written: req.body.written,
        medium: req.body.medium,
        times: req.body.times,
        days: req.body.days,
        hours: req.body.hours,
        trackingDate: req.body.trackingDate
    },{
        new: true
    });

    //If not existing, return 404 - Not Found
    if (!requirements) return res.status(404).send('Requerimiento no encontrado'); // Error 404 

    //Return the updated course
    res.send(requirements);
});


module.exports = router;