const auth = require('../middleware/auth');
const { Records, Counter, validate} = require('../models/record');
const {Flow} = require('../models/flow');
const { Typifications } = require('../models/typification');
const { ChildTypifications } = require('../models/childtypification');
const { Requirements } = require('../models/requirements');
const { Channels } = require('../models/channels');
const { Contacts } = require('../models/contacts');
const { Users } = require('../models/user');
const {validateCounter, updateCounter, createRecord, calcFinDate, uploadFile} = require('../middleware/records');
const {createFlow} = require('../middleware/flow');
const appDebuger = require('debug')('app:app');
const appRecord = require('debug')('app:record');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Joi = require('joi'); //Validacion de Inputs en el servicio
const moment = require('moment'); //Libreria para manejo de fechas
const fs = require('fs');
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });


//'BUSCAR RADICADO' GET Method
router.get('/:id', auth, async (req, res) => {
    try{

        
        //If not existing, return 404 - Not Found
        const records = await Records.find({"ref": req.params.id, "status": false});
        if (!records) return res.status(404).send({'Error':'No se encuentran referencias de credito para este cliente.'}); // Error 404 
        
        let i = records.length;
        let p = i - 1;
        let currentRecord;
        while(i > 0){ 
            let typification = await Typifications.findById(records[p].typification);
            if (!typification || typification.length == 0) return res.status(404).send('No se encontro una tipificación.'); // Error 404 
            
            let child = await ChildTypifications.findById(records[p].child);
            if (!child || child.length == 0) return res.status(404).send('No se encontro una tipificación especifica.'); // Error 404 
            
            let channel = await Channels.findById(records[p].channel);
            if (!channel || channel.length == 0) return res.status(404).send('No se encontro una canal de comunicaciones.'); // Error 404 
            
            let contact = await Contacts.findById(records[p].contact);
            if (!contact || contact.length == 0) return res.status(404).send('No se encontro un contacto.'); // Error 404 
            

            records[p].typification = typification.name;
            records[p].child = child.name;
            records[p].channel = channel.name;
            records[p].contact = contact.name;

            i = i - 1;
            p = p - 1; 
        }
        res.send(records);
    }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    }
});

router.get('/close/:id', auth, async (req, res) => {
    try{

        
        //If not existing, return 404 - Not Found
        const records = await Records.find({"ref": req.params.id, "status": true});
        appRecord(records);
        if (!records) return res.status(404).send({'Error':'No se encuentran referencias de credito para este cliente'}); // Error 404 
        
        let i = records.length;
        let p = i - 1;
        let currentRecord;
        while(i > 0){ 
            let typification = await Typifications.findById(records[p].typification);
            if (!typification || typification.length == 0) return res.status(404).send('No se encontro una tipificación.'); // Error 404 
            
            let child = await ChildTypifications.findById(records[p].child);
            if (!child || child.length == 0) return res.status(404).send('No se encontro una tipificación especifica.'); // Error 404 
            
            let channel = await Channels.findById(records[p].channel);
            if (!channel || channel.length == 0) return res.status(404).send('No se encontro una canal de comunicaciones.'); // Error 404 
            
            let contact = await Contacts.findById(records[p].contact);
            if (!contact || contact.length == 0) return res.status(404).send('No se encontro un contacto.'); // Error 404 
            

            records[p].typification = typification.name;
            records[p].child = child.name;
            records[p].channel = channel.name;
            records[p].contact = contact.name;

            i = i - 1;
            p = p - 1; 
        }
        res.send(records);
    }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    }
});

//'CREAR RADICADO' POST Method
router.post('/',  async (req, res) => {
    try
    {
        let record = req.body;
        
        //Validate Data
        //If invalid, return 404 - Bad Request
        const { error } = validate(record);
        if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

        // Create or Update Counter
        const counter  = await validateCounter();
        let currentCounter = null;
        if (!counter) currentCounter =  1;
        if (counter) currentCounter =  await updateCounter();
        record.number = currentCounter; //Agrego el numero de radicado
        
        // Get Current Date
        let currentTime = moment();
        record.date = currentTime.format('YYYY-MM-DD HH:mm'); //Agrego la fecha de creación

        //Get Child Typification
        const child = await ChildTypifications.findOne({"_id": req.body.child});
        if (!child) return res.status(404).send('Tipificación Especifica no encontrada'); // Error 404 

        //Get Typification 
        const typification = await Typifications.findOne({"_id": child.idParent});
        if (!typification) return res.status(404).send('Tipificación no encontrada'); // Error 404 
        
        //Get Requirement P.Q.R
        const requirement = await Requirements.findOne({"_id": child.requirement});
        if (!requirement) return res.status(404).send('PQR/Requerimiento no encontrado'); // Error 404 

        //Guardo la tipificación general y especifica
        record.typification = typification._id;
        record.child = child._id;

        //Guardo el Tipo de PQR
        let requirementType = requirement.times;
        appRecord('Tipo de PQR: ' + requirementType);

        //Definimos los campos de radicado(Record)
        record.caseFinTime = 0;
        record.caseFinDate = moment(record.date).format('YYYY-MM-DD HH:mm');
        record.caseLight = 100;
        record.area = child.levels[0].area;
        record.levels = [];
        record.caseLight = 100;
        record.status = true;
        record.createdBy = req.body.user;

        if (requirementType != 'Inmediato'){
             //Tiempo Total 
            const totalHours = (requirement.days * 24) + (requirement.hours);
            deadTime = currentTime.add(totalHours ,'hours');

           

            record.caseFinTime = totalHours;
            record.caseFinDate = deadTime.format('YYYY-MM-DD HH:mm');
            
            if(requirement.trackingDate == true)  {
                record.caseFinDate = moment(req.body.trackingDate).add(totalHours ,'hours').format('YYYY-MM-DD HH:mm');
            record.trackingDate = moment(req.body.trackingDate).format('YYYY-MM-DD HH:mm');
            }
             //Tiempo de los Niveles
             closeTimes = await calcFinDate(record.date, child._id);
             lastLevel = closeTimes.levels - 1; //Busco la maxima fecha


            record.caseLight = 100;
            record.area = child.levels[0].area;
    
            //Levels
            //Calculo las horas totales que tiene un usuario para finalizar
            let finalUserTime = null;
            if (child.levels[0].days > 0 ) finalUserTime = (child.levels[0].days * 24) + child.levels[0].hours;
            if (child.levels[0].days < 0 ) finalUserTime = child.levels[0].hours;
            const levels = [
                {finalUserTime: finalUserTime},
                {userFinDate: null},
                {userLight : 100}
            ];
            record.levels = closeTimes;
            // Calcular Semaforos
            record.caseLight = 100;
    
            record.status = false;
        }
       
      
       req.body.file = '';
    //    appDebuger(req.body.file );
    //    const myFile  = await uploadFile(req.body.file);
        //Guardar el radicado
        const saveRecord  = await createRecord(record);
        
        
        //Get User
        const currentUser = await Users.findOne({"_id": child.levels[0].user});
        if (!currentUser) return res.status(404).send('Usuario no encontrado'); // Error 404 
        
       
        //Crear Flujo si se crea el radicado
        if (saveRecord._id) {
        //Flujo de quien creo el radicado (Record)
        const iniFlow = {};
        iniFlow.record = saveRecord._id;
        iniFlow.user =  req.body.user;
        iniFlow.level = -1;
        iniFlow.status = false;
        iniFlow.observations = record.observations;
        iniFlow.finDate = moment(record.date).format('YYYY-MM-DD HH:mm');
        iniFlow.light = 100;
        iniFlow.timestamp = moment(record.date).format('YYYY-MM-DD HH:mm');
        
        let saveflow =  createFlow(iniFlow);
        if (!saveflow) return res.status(404).send({'ERRROR:': ' El radicado se creo pero no el flujo'}); // Error 404 
       
        //Flujo de quien se le asigan el radicado
        const flow = {};
        flow.record = saveRecord._id;
        flow.user =  currentUser._id;
        flow.level = 0;
        if(requirementType == 'Inmediato') flow.status = false;
        if(requirementType != 'Inmediato') flow.status = true;
        if(requirementType == 'Inmediato') flow.finDate = moment(record.date).format('YYYY-MM-DD HH:mm');
        if(requirementType != 'Inmediato') flow.finDate = closeTimes[0];
        flow.light = 100;
        if(requirementType == 'Inmediato') flow.case = 4; //Se cierra inmediatamente
        if(requirementType != 'Inmediato') flow.case = 5; //Se crea como abierto
        flow.timestamp = moment(record.date).format('YYYY-MM-DD HH:mm');

        saveflow =  createFlow(flow);
        if (!saveflow) return res.status(404).send({'ERRROR:': ' El radicado se creo pero no el flujo'}); // Error 404 
        }
      
        res.send(record);

    } 
    catch (ex) {
        console.log(ex);
        res.status(500).send({'Error': 'Algo salio mal :('})
    }
});

//'SUBIR ARCHIVO'
router.post('/upload', upload.single('avatar'), async(req, res) => {
   appDebuger(JSON.stringify(req.body.file)); 
   appDebuger(req.body); 
   res.send("Let's go")
     
});
module.exports = router;