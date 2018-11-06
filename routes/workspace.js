const auth = require('../middleware/auth');
const { Records, Counter, validate} = require('../models/record');
const {Flow} = require('../models/flow');
const { Typifications } = require('../models/typification');
const { ChildTypifications } = require('../models/childtypification');
const {Holiday} = require('../models/holidays');
const { Channels } = require('../models/channels');
const { Contacts } = require('../models/contacts');
const { Users } = require('../models/user');
const {validateCounter, updateCounter, createRecord, calcFinDate} = require('../middleware/records');
const {createFlow} = require('../middleware/flow');
const appDebuger = require('debug')('app:app');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Joi = require('joi'); //Validacion de Inputs en el servicio
const moment = require('moment'); //Libreria para manejo de fechas





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
        let currentTime = moment().set({'date': 2, 'hour': 11, 'minute': 30, 'second': 0, 'millisecond': 0});;
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
        closeTimes = await calcFinDate(currentTime, child._id);
        lastLevel = closeTimes.levels - 1; //Busco la maxima fecha

        record.caseFinTime = child.maxTime;
        record.caseFinDate = closeTimes[lastLevel];
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
        res.send(record);
        
       
        

    } 
    catch (ex) {
        console.log(ex);
        res.status(500).send({'Error': 'Algo salio mal :('})
    }
});

module.exports = router;