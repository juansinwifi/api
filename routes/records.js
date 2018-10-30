const auth = require('../middleware/auth');
const { Records, Counter, validate} = require('../models/record');
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

//'CREAR TIPIFICACIÓN' POST Method
router.post('/',  async (req, res) => {
    try
    {
        
        //Validate Data
        //If invalid, return 404 - Bad Request
        const { error } = validate(req.body);
        if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

        // Create or Update Counter
        const counter  = await validateCounter();
        let currentCounter = null;
        if (!counter) currentCounter =  1;
        if (counter) currentCounter =  await updateCounter();
        req.body.number = currentCounter;
          
        // Get Current Date
        let currentTime = moment().format();
        req.body.date = currentTime;
    
        //Guardar el radicado
        const saveRecord  = await createRecord(req.body);
        
        //Get Final Time User
        const child = await ChildTypifications.findOne({"_id": req.body.child});
        if (!child) return res.status(404).send('Cliente no encontrado'); // Error 404 
        
        let finalUserTime = null;
        if (child.levels[0].days > 0 ) finalUserTime = (child.levels[0].days * 24) + child.levels[0].hours;
        if (child.levels[0].days < 0 ) finalUserTime = child.levels[0].hours;
        
        //Get User
        const currentUser = await Users.findOne({"_id": child.levels[0].user});
        if (!child) return res.status(404).send('Usuario no encontrado'); // Error 404 
        
        //Get Typification 
        const currentTypification = await Typifications.findOne({"_id": child.idParent});
        if (!currentTypification) return res.status(404).send('Tipificación no encontrada'); // Error 404 

        const flow = {};
        flow.record = currentCounter;
        flow.date = currentTime;
        flow.user = {"_id": child.levels[0].user, "name": currentUser.user};
        flow.userTime = finalUserTime;
        flow.caseTime = child.maxTime;
        flow.userLight = 100;
        flow.caseLight = 100;
        flow.typification = {"_id": child.idParent, "name": currentTypification.name};
        flow.childTypification = {"_id": child._id, "name": child.name};
        flow.area = child.levels[0].area;
        flow.level = 0;
        flow.status = true;
        
        let  saveflow = {};
        if (saveRecord) saveflow = await createFlow(flow);

        res.send(saveRecord);

    } 
    catch (ex) {
        console.log(ex);
        res.status(500).send({'Error': 'Algo salio mal :('})
    }
});

module.exports = router;