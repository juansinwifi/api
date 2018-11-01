const auth = require('../middleware/auth');
const { Records, Flow, Counter, validate} = require('../models/record');
const { Typifications } = require('../models/typification');
const { ChildTypifications } = require('../models/childtypification');
const { Users } = require('../models/user');
const {validateCounter, updateCounter, createFlow, createRecord} = require('../middleware/records');
const appDebuger = require('debug')('app:app');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Joi = require('joi'); //Validacion de Inputs en el servicio
const moment = require('moment'); //Libreria para manejo de fechas


//'BUSCAR RADICADO' GET Method
router.get('/:id', auth, async (req, res) => {
    try{

        
        //If not existing, return 404 - Not Found
        const records = await Records.find({"customer": req.params.id});
        if (!records || records.length == 0) return res.status(404).send('No se encuentran Radicados para este cliente.'); // Error 404 
        
        let i = records.length;
        let p = i - 1;
        let currentRecord;
        while(i > 0){ 
            let typification = await Typifications.findById(records[p].typification);
            if (!typification || typification.length == 0) return res.status(404).send('No se econtro una tipificación.'); // Error 404 
            appDebuger(records[p]);
            //currentRecord[xxxx] = { "_id": records[p].typification, "name": typification.name }
            
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
        let currentTime = moment().format();
        record.date = currentTime; //Agrego la fecha de creación

        //Get Child Typification
        const child = await ChildTypifications.findOne({"_id": req.body.child});
        if (!child) return res.status(404).send('Tipificación Especifica no encontrada'); // Error 404 

        //Get Typification 
        const typification = await Typifications.findOne({"_id": child.idParent});
        if (!typification) return res.status(404).send('Tipificación no encontrada'); // Error 404 

        //Guardo la tipificación general y especifica
        record.typification = typification._id;
        record.child = child._id;

        //Tiempo Total y Area
        record.caseFinTime = child.maxTime;
        record.caseFinDate = 'Sin Calcular';
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
        record.levels = levels;


        // Calcular Semaforos

        record.caseLight = 100;

        //Guardar el radicado
        const saveRecord  = await createRecord(record);
        
        
        //Get User
        const currentUser = await Users.findOne({"_id": child.levels[0].user});
        if (!child) return res.status(404).send('Usuario no encontrado'); // Error 404 
        
       
        //Crear Flujo si se crea el radicado
        if (saveRecord._id) {
        const flow = {};
        flow.record = saveRecord._id;
        flow.user =  child.levels[0].user;
        flow.level = 0;
        flow.status = true;
        flow.observation = record.observation;
        saveflow =  createFlow(flow);
        }
      
        res.send(record);

    } 
    catch (ex) {
        console.log(ex);
        res.status(500).send({'Error': 'Algo salio mal :('})
    }
});

module.exports = router;