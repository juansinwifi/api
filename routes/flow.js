const auth = require('../middleware/auth');
const {Flow} = require('../models/record');
const {Areas} = require('../models/areas');
const appDebuger = require('debug')('app:app');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Joi = require('joi'); //Validacion de Inputs en el servicio
const moment = require('moment');

/***********/
/* Flow    */
/**********/

//'BUSCAR TODOS LOS RADICADOS DE UN USUARIO' GET Method
router.get('/:id', async (req, res) => {
    try{
        
        const flow = await Flow.find({"user._id": req.params.id, "status": true});
        if (!flow) return res.status(404).send('Inbox no encontrado'); // Error 404 
       

        res.send(flow);
    }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    } 
});

//'BUSCAR UN RADICADO ESPECIFICO' GET Method
router.get('/flow/:id', async (req, res) => {
    try{
        
    const flow = await Flow.find({"_id": req.params.id, "status": true});
    if (!flow) return res.status(404).send('Radicado no encontrado'); // Error 404 
       

        res.send(flow);
    }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    } 
});

module.exports = router;