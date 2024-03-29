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


//'BUSCAR RADICADO por credito' GET Method
router.get('/:id', auth, async (req, res) => {
    try{

        // appRecord(req.params.id)
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

//'BUSCAR RADICADO por cedula' GET Method
router.get('/customer/:id', auth, async (req, res) => {
    try{
        
        //If not existing, return 404 - Not Found
        const records = await Records.find({"customer": req.params.id, "status": false});
        if (!records) return res.status(404).send({'Error':'No se encuentran radicados para este cliente.'}); // Error 404 
       
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

router.get('/customer/close/:id', auth, async (req, res) => {
    try{
      
        //If not existing, return 404 - Not Found
        const records = await Records.find({"customer": req.params.id, "status": true});
        
        if (!records) return res.status(404).send({'Error':'No se encuentran radicados para este cliente.'}); // Error 404 
       
        let i = 0;
        while(records[i]){ 
            
            let typification = await Typifications.findById(records[i].typification.replace(/ /g, ""));
            if (!typification || typification.length == 0) return res.status(404).send('No se encontro una tipificación.'); // Error 404 
            
            let child = await ChildTypifications.findById(records[i].child.replace(/ /g, ""));
            if (!child || child.length == 0) return res.status(404).send('No se encontro una tipificación especifica.'); // Error 404 
            
            let channel = await Channels.findById(records[i].channel.replace(/ /g, ""));
            if (!channel || channel.length == 0) return res.status(404).send('No se encontro una canal de comunicaciones.'); // Error 404 
            
            appRecord(records[i].contact.length)
            // contact = await Contacts.findById(records[i].contact.replace(/ /g, ""));
            // if (!contact || contact.length == 0) return res.status(404).send('No se encontro un contacto.'); // Error 404 
            

            records[i].typification = typification.name;
            records[i].child = child.name;
            records[i].channel = channel.name;
            // records[i].contact = contact.name;

            i++;
            
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
        appRecord(record);
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
        record.customerName = req.body.customerName;
        
        //Campos que vienen de la saba de gestión
         appRecord(record.pastdueAge)
         appRecord(record.totalPay)
         appRecord(record.minPay)

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

        flowFile = record.file;
        if(record.file == null)  flowFile = ' ';
        
        appDebuger('######## ' + flowFile + ' ########');
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
        
        if(flowFile == null) iniFlow.file = " ";
        if(flowFile != null) iniFlow.file = flowFile;
        
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
        flow.file =" ";
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
router.post('/upload', async(req, res) => {
  
    try
    {

    // appDebuger(req.body)
    // //If invalid, return 404 - Bad Request
    // appDebuger(req.body.file);
   
    if (!req.files) {
        res.status(500).send({'Error':'No hay archivo para subir.'});
    }

    //   const record = req.body.record;
    //   const flow = req.body.flow; 

      let file = req.files.file;
      appDebuger(file);
      //Verificar si esta creado el folder raiz
      const root = './uploads/records/';
      if (!fs.existsSync(root)){
        fs.mkdirSync(root, 0775);
        appDebuger('Folder: Raiz Creado')
      }
      
      //Verificar si esta creado el folder año
      const year =  moment().format('YYYY');
      if (!fs.existsSync(root + year)){
        fs.mkdirSync(year, 0775);
        appDebuger('Folder: Año Creado')
      }

      //Verificar si esta creado el folder mes
      const month =  '/' + moment().format('MM');
      if (!fs.existsSync(root + year + month)){
        fs.mkdirSync(month, 0775);
        appDebuger('Folder: Mes Creado')
      }


      const random = Math.random().toString(36).substring(5, 10);
      const path = root + year + month + '/' + random + '_' + file.name;

      //Use the mv() method to place the file somewhere on your server
      file.mv(path, async function(err) {
        if (err) return res.status(500).send(err);
        if (!err)  {

            appDebuger({'OK':'Archivo Subido! ' + file.name});
            const savePath = '/' + year + month + '/' + random + '_' + file.name;
            // const updateFlow = await Flow.findOneAndUpdate({"_id": flow}, {
            //     file: savePath
            // },{ year + month + '/' + file.name;
            //     new: true
            // });
            res.send(savePath);
        }
      });
    }

      catch (ex) {
        console.log(ex);
        res.status(500).send(ex);
    }
     
});
module.exports = router;