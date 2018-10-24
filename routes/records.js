const auth = require('../middleware/auth');
const { Records, validate} = require('../models/record');
const express = require('express');
const router = express.Router();
const Joi = require('joi'); //Validacion de Inputs en el servicio

//'CREAR TIPIFICACIÓN' POST Method
router.post('/', auth, async (req, res) => {
    try
    {
        req.body.number =  1;
        //Validate Data
        //If invalid, return 404 - Bad Request
        const { error } = validate(req.body);
        if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);
        
        // let typification = new Typifications({
        //     name: req.body.name
        // });
        // typification = await typification.save();
        
        res.send(req.body);
    } 
    catch (ex) {
        console.log(ex);
        res.status(500).send({'Error': 'Algo salio mal :('})
    }
});

module.exports = router;