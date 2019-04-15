const auth = require('../middleware/auth');
const {backFlow, nextFlow, changeFlow, closeFlow, assingFlow, diffDate} = require('../middleware/flow');
const {Records} = require('../models/record');
const {Flow, validateFlow} = require('../models/flow');
const { Typifications } = require('../models/typification');
const { ChildTypifications } = require('../models/childtypification');
const { Channels } = require('../models/channels');
const { Contacts } = require('../models/contacts');
const { Customer } = require('../models/customer');
const {Lights} = require('../models/lights');
const {validateCounter, updateCounter, createRecord, calcFinDate, uploadFile} = require('../middleware/records');
const {createFlow} = require('../middleware/flow');
const {Users} = require('../models/user');
const {Areas} = require('../models/areas');
const appFlow = require('debug')('app:flow');
const appFlowUser = require('debug')('app:flowUser');
const appHistory = require('debug')('app:History');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Joi = require('joi'); //Validacion de Inputs en el servicio
const moment = require('moment');
const fs = require('fs');
/***********/
/* AREA DE PRUEBAS */
/***********/



//Actualizar Clientes
router.get('/',  async (req, res) => {
    const file = fs.readFileSync('./uploads/migration/records.json', 'utf8')
   
    const record = JSON.parse(file);
    let i = 0;
    
    while(record[i]){

        // Create or Update Counter
        const counter  = await validateCounter();
        let currentCounter = null;
        if (!counter) currentCounter =  1;
        if (counter) currentCounter =  await updateCounter();
       
        record[i].number = currentCounter; //Agrego el numero de radicado
        
        //Guardo el Tipo de PQR
        
        const newRecord = {};
        
        //Definimos los campos de radicado(Record)
        newRecord.customer = record[i].customer;
        newRecord.ref= record[i].ref;
        newRecord.number = currentCounter;
        newRecord.name = "Sin Nombre";
        newRecord.date = record[i].date;
        newRecord.typification = record[i].typification;
        newRecord.child = record[i].child;
        newRecord.channel = record[i].channel;
        newRecord.contact = record[i].contact;
        newRecord.caseFinTime = 0;
        newRecord.caseFinDate = record[i].date;
        newRecord.caseLight = 100;
        newRecord.levels = [];
        newRecord.caseLight = 100;
        newRecord.status = true;
        newRecord.createdBy = "5c9c22e45b4aff38867efa69";
        newRecord.customerName = record[i].name;
        newRecord.area = record[i].area;
        appFlow(newRecord);
        const saveRecord  = await createRecord(newRecord);
        
        //Flujo 
        flowFile = ' ';
        const numberRecord = [];
        numberRecord.push(saveRecord.number);
        //Crear Flujo si se crea el radicado
        if (saveRecord._id) {
        //Flujo de quien creo el radicado (Record)
        const iniFlow = {};
        iniFlow.record = saveRecord._id;
        iniFlow.user =  "5c9c22e45b4aff38867efa69";
        iniFlow.level = -1;
        iniFlow.status = false;
        iniFlow.observations = " ";
        iniFlow.finDate = record[i].date;
        iniFlow.light = 100;
        iniFlow.timestamp = moment(record.date).format('YYYY-MM-DD HH:mm');
        if(flowFile != null) iniFlow.file = flowFile;
        let saveflow =  createFlow(iniFlow);
   
        // //Flujo de quien se le asigan el radicado
        const flow = {};
        flow.record = saveRecord._id;
        flow.user =  record[i].user;
        flow.level = 0;
        flow.status = false;
        flow.finDate = record[i].date;
        flow.light = 100;
        flow.case = 4; 
        flow.reject = record[i].reject;
        flow.observations = record[i].observations;
        flow.timestamp = moment(record.date).format('YYYY-MM-DD HH:mm');
        flow.file =" ";
        saveflow =  createFlow(flow);
    
        i++;
        }
    }
    res.send("Mama Miaa!!");
    
       
       


});


module.exports = router;