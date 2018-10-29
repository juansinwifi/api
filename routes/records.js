const auth = require('../middleware/auth');
const { Records, Counter, validate} = require('../models/record');
const { Typifications } = require('../models/typification');
const { ChildTypifications } = require('../models/childtypification');
const { Users } = require('../models/user');
const {validateCounter, updateCounter} = require('../middleware/records');
const appDebuger = require('debug')('app:app');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Joi = require('joi'); //Validacion de Inputs en el servicio

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
        let currentTime = new Date().toLocaleString('en-US', {
            timeZone: 'America/Bogota'
          });;
        req.body.date = currentTime;
        
       
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
        flow.UserTime = finalUserTime;
        flow.CaseTime = child.maxTime;
        flow.typification = {"_id": child.idParent, "name": currentTypification.name};
        flow.childTypification = {"_id": child._id, "name": child.name};
        flow.level = 0;
        flow.status = true;
        appDebuger(flow);

        res.send(flow);

    } 
    catch (ex) {
        console.log(ex);
        res.status(500).send({'Error': 'Algo salio mal :('})
    }
});

module.exports = router;