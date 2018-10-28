const auth = require('../middleware/auth');
const {Rejects, validate} = require('../models/rejects');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Joi = require('joi'); //Validacion de Inputs en el servicio

/************/
/* rejects */
/***********/



//'BUSCAR Causal de Rechazo' GET Method
router.get('/', async (req, res) => {
    try {
        const rejects = await Rejects.find().sort('name');
        res.send(rejects);
        }
    catch(ex){
            console.log(ex);
            res.status(500).send({ 'Error': 'Algo salio mal :('});
        }
    
});


//'BUSCAR UN Causal de Rechazo ESPECIFICO' GET Method
router.get('/:id', async (req, res) => {
    try{
        //Look up the Profiles
        //If not existing, return 404 - Not Found
        const reject = await Rejects.findOne(req.params.id);
        if (!reject) return res.status(404).send('Causal de rechazo no encontrado'); // Error 404 
        res.send(reject);
    }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    } 
});

//'CREAR Causal de Rechazo' POST Method
router.post('/', async (req, res) => {

    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let reject = new Rejects({
        name: req.body.name
    });
   
    reject = await reject.save();
    res.send(reject);

});

//'MODIFICAR Causal de Rechazo' PUT Method
router.put('/:id', async (req, res) => {

     //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validate(req.body);
    //if (error) return res.status(400).send(error.details[0].message);
    if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

   const reject = await Rejects.findByIdAndUpdate(req.params.id, {
        name: req.body.name
    },{
        new: true
    });

    //If not existing, return 404 - Not Found
    if (!reject) return res.status(404).send('Causal de rechazo no encontrado'); // Error 404 

    //Return the updated course
    res.send(reject);

});

module.exports = router;