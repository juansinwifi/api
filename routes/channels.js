const auth = require('../middleware/auth');
const {Channels, validate} = require('../models/channels');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Joi = require('joi'); //Validacion de Inputs en el servicio

/*************************/
/* COMUNICATION CHANNEL */
/***********************/

//'BUSCAR Canal de Comunicaciones' GET Method
router.get('/', auth, async (req, res) => {
    try {
        const channels = await Channels.find().sort('name');
        res.send(channels);
        }
    catch(ex){
            console.log(ex);
            res.status(500).send({ 'Error': 'Algo salio mal :('});
        }
});


//'BUSCAR UN Canal de Comunicaciones ESPECIFICO' GET Method
router.get('/:id', auth, async (req, res) => {
    try{
        //Look up the Profiles
        //If not existing, return 404 - Not Found
        const channel = await Channels.findOne({"_id": req.params.id});
        if (!channel) return res.status(404).send('Canal de Comunicaciones no encontrado'); // Error 404 
        res.send(channel);
    }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    } 
});

//'CREAR Canal de Comunicaciones' POST Method
router.post('/', auth, async (req, res) => {
    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let channel = new Channels({
        name: req.body.name
    });
   
    channel = await channel.save();
    res.send(channel);

});

//'MODIFICAR Canal de Comunicaciones' PUT Method
router.put('/:id', auth, async (req, res) => {

    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validate(req.body);
    //if (error) return res.status(400).send(error.details[0].message);
    if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

   const channel = await Channels.findByIdAndUpdate(req.params.id, {
        name: req.body.name
    },{
        new: true
    });

    //If not existing, return 404 - Not Found
    if (!channel) return res.status(404).send('Canal de Comunicaciones no encontrado'); // Error 404 

    //Return the updated course
    res.send(channel);
    
});

module.exports = router;