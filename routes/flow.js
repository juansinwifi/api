const auth = require('../middleware/auth');
const {backFlow, nextFlow, changeFlow, closeFlow, assingFlow} = require('../middleware/flow');
const {Records} = require('../models/record');
const {Flow, validateFlow} = require('../models/flow');
const { Typifications } = require('../models/typification');
const { ChildTypifications } = require('../models/childtypification');
const { Channels } = require('../models/channels');
const { Contacts } = require('../models/contacts');
const {Users} = require('../models/user');
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
     
        const response = [];
        i = flow.length;
        p = i - 1 ;
        while ( i > 0){
            const findRecord = await Records.find({"_id": flow[p].record});
            if (!findRecord || findRecord.length == 0) return res.status(404).send('No se encuentran Radicados para este usuario.'); // Error 404 
            
            let typification = await Typifications.findById(findRecord[0].typification);
            if (!typification || typification.length == 0) return res.status(404).send('No se encontro una tipificación.'); // Error 404 
            
            let child = await ChildTypifications.findById(findRecord[0].child);
            if (!child || child.length == 0) return res.status(404).send('No se encontro una tipificación especifica.'); // Error 404 
            
            //Verificar el estado del semaforo
            let currentTime = moment().format();
            appDebuger('Consulta: ' +  currentTime);
            appDebuger('Vence: ' + flow[p].finDate);
            
            const record = { 
                _id: findRecord[0]._id,
                number: findRecord[0].number,
                userLight: flow[p].light,
                caseLight: findRecord[0].caseLight,
                typification: typification.name,
                child: child.name,
                date: findRecord[0].date,
            };
            response.push(record);
            i = i - 1;
            p = p - 1;
        }

        res.send(response);
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
        if (!records || records.length == 0) return res.status(404).send('No se encuentran Radicados.'); // Error 404 
        
        const flow = await Flow.find({"record": req.params.id, "status": true});
        if (!flow) return res.status(404).send('Inbox no encontrado'); // Error 404 
        
        let typification = await Typifications.findById(records[0].typification);
            if (!typification || typification.length == 0) return res.status(404).send('No se encontro una tipificación.'); // Error 404 
            
        let child = await ChildTypifications.findById(records[0].child);
        if (!child || child.length == 0) return res.status(404).send('No se encontro una tipificación especifica.'); // Error 404 
        
        let channel = await Channels.findById(records[0].channel);
        if (!channel || channel.length == 0) return res.status(404).send('No se encontro una canal de comunicaciones.'); // Error 404 
        
        let contact = await Contacts.findById(records[0].contact);
        if (!contact || contact.length == 0) return res.status(404).send('No se encontro un contacto.'); // Error 404 
        
        let i = flow.length;
        let p = i - 1;
        while ( i > 0){
            let user = await Users.findById(flow[p].user);
            if (!user || user.length == 0) return res.status(404).send('No se encontro el usuario.'); // Error 404 
          
            flow[p].user = user.name;
            i = i - 1;
            p = p - 1;
        }
     
        
        records[0].typification = typification.name;
        records[0].child = child.name;
        records[0].channel = channel.name;
        records[0].contact = contact.name;

        result.records = records;
        
        result.flow = flow;

        res.send(result);

    }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    } 
});

//Guardo el estado del flujo
router.post('/flow/:id', async(req, res) =>{

    try{
        const { error } = validateFlow(req.body);
        //if (error) return res.status(400).send(error.details[0].message);
        if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);
        
        //Los casos estan "quemados" ver case.js si se mofican cambiaria la logica
        let flow = null;
        if (req.body.case == 1)  flow = await backFlow(req); //'Rechazar - Devolver'
        if (req.body.case == 2)  flow = await nextFlow(req); //'Finalizar -Avanzar'
        if (req.body.case == 3)  flow = await changeFlow(req); //'En Gestión'
        if (req.body.case == 4)  flow = await closeFlow(req); //'Cerrar Caso'
        if (req.body.case == 5)  flow = await changeFlow(req); //'Abierto'
        if (req.body.case == 6)  flow = await assingFlow(req); //'Reasignar Caso'
        if (req.body.case > 6)  return res.status(400).send('Gestión de caso no encontrado'); 
        if (flow.ERROR) return res.status(400).send(flow);
        
        res.send(flow);
    }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    }
});

module.exports = router;