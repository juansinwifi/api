const auth = require('../middleware/auth');
const {Flow, Records} = require('../models/record');
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
        
        const flow = await Flow.find({"user": req.params.id, "status": true});
        if (!flow) return res.status(404).send('Inbox no encontrado'); // Error 404 
        let records =[];
        i = flow.length;
        while ( i > 0){
            j = i -1;
            let record = await Records.find({"_id": flow[j].record});
            if (!record || record.length == 0) return res.status(404).send('No se encuentran Radicados para este usuario.'); // Error 404 
            records.push(record);
            i = i -1;
        }

        res.send(records);
    }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    } 
});

//'BUSCAR UN RADICADO ESPECIFICO' GET Method
router.get('/flow/:id', async (req, res) => {
    try{
        const result = {}
        const records = await Records.find({"_id": req.params.id});
        if (!records || records.length == 0) return res.status(404).send('No se encuentran Radicados para este cliente.'); // Error 404 
        
        const flow = await Flow.find({"record": req.params.id, "status": true});
        if (!flow) return res.status(404).send('Inbox no encontrado'); // Error 404 
        
        result.records = records;
        result.flow = flow;

        res.send(result);

    }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    } 
});

module.exports = router;