const auth = require('../middleware/auth');
const {Lights, validate} = require('../models/lights');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Joi = require('joi'); //Validacion de Inputs en el servicio

/***********/
/* Lights */
/**********/

const lights = [
    { id: 1, green: 100, yellow: 50, red: 5, name: "Usuarios" },
    { id: 2, green: 100, yellow: 50, red: 5, name: "Casos" }
];

//'BUSCAR Canal de Comunicaciones' GET Method
router.get('/', auth, async(req, res) => {
    try {
        const lights = await Lights.find().sort('name');
        res.send(lights);
        }
    catch(ex){
            console.log(ex);
            res.status(500).send({ 'Error': 'Algo salio mal :('});
    }
});


//'BUSCAR UN Semaforo' GET Method
router.get('/:id', auth, async (req, res) => {
    try{
        //Look up the Profiles
        //If not existing, return 404 - Not Found
        const light = await Lights.findOne(req.params.id);
        if (!light) return res.status(404).send('Semaforo no encontrado'); // Error 404 
        res.send(light);
    }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    } 
});


//'CREAR Semaforo' POST Method
router.post('/', auth, async (req, res) => {

    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let channel = new Channels({
        green: req.body.green, 
        yellow: req.body.yellow, 
        red: req.body.red, 
        name: req.body.name, 
        observations: req.body.observations 
    });
   
    light = await Lights.save();
    res.send(light);

});


//'MODIFICAR Semaforo' PUT Method
router.put('/:id', auth, async (req, res) => {
    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validate(req.body);
    //if (error) return res.status(400).send(error.details[0].message);
    if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

   const channel = await Lights.findByIdAndUpdate(req.params.id, {
        green: req.body.green, 
        yellow: req.body.yellow, 
        red: req.body.red, 
        name: req.body.name, 
        observations: req.body.observations 
    },{
        new: true
    });

    //If not existing, return 404 - Not Found
    if (!light) return res.status(404).send('Semaforo no encontrado'); // Error 404 

    //Return the updated course
    res.send(light);
});



module.exports = router;