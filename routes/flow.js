const auth = require('../middleware/auth');
const {Flow} = require('../models/record');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Joi = require('joi'); //Validacion de Inputs en el servicio

/***********/
/* Flow    */
/**********/

//'BUSCAR UN Semaforo' GET Method
router.get('/:id', async (req, res) => {
    try{
        //Look up the Profiles
        //If not existing, return 404 - Not Found
        console.log(req.params.id);
        const flow = await Flow.findOne({"user._id": req.params.id});
        if (!flow) return res.status(404).send('Inbox no encontrado'); // Error 404 
        flow.userLight = 90;
        flow.caseLight = 80;
        console.log(flow.userLight)
        res.send(flow);
    }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    } 
});

module.exports = router;