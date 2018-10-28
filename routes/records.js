const auth = require('../middleware/auth');
const { Records, Counter, validate} = require('../models/record');
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

        
        res.send(req.body);

    } 
    catch (ex) {
        console.log(ex);
        res.status(500).send({'Error': 'Algo salio mal :('})
    }
});

module.exports = router;