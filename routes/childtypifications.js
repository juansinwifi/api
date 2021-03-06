const auth = require('../middleware/auth');
const { ChildTypifications, validate, validateForms, validateLevels } = require('../models/childtypification');
const { Typifications } = require('../models/typification');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Joi = require('joi'); //Validacion de Inputs en el servicio

/******************************/
/* TIPIFICACIONES ESPECIFICAS */
/*****************************/


//'BUSCAR TIPIFICACIONES ESPECIFICAS' GET Method
router.get('/', auth, async(req, res) => {
    const childTypifications = await ChildTypifications.find().sort('name');
    const typifications = [];
    let i = 0;
    while (childTypifications[i]){
        let typification = await Typifications.findById(childTypifications[i].idParent);
       
        childTypifications[i]['description'] =  childTypifications[i]['description'] + ' | ' + typification.name;
        i++;
    };
    
    res.send(childTypifications);
});

//'BUSCAR UNA TIPIFICACION ESPECIFICA' GET Method
router.get('/:id', auth, async(req, res) => {
    try {
        //Buscar un  caso especifico
        //Si no existe, return 404 - Not Found
        const childTypifications = await ChildTypifications.findById(req.params.id);
        if (!childTypifications) return res.status(404).send('Tipificación Especifica no encontrada'); // Error 404 
        
        
        res.send(childTypifications);
    } catch (ex) {
        res.status(500).send({ 'Error': 'Algo salio mal :(' })
    }

});

//'CREAR TIPIFICACIÓN ESPECIFICAS' POST Method
router.post('/', auth, async (req, res) => {

    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validate(req.body);
    if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

    let nForms = 0;
    let nLevels = 0;

    while (req.body.forms[nForms]) {
        const validateForm = validateForms(req.body.forms[nForms]);
        if (validateForm.error) return res.status(400).send(validateForm.error.details[0].message + '. PATH: Forms[' + nForms + '] ' + validateForm.error.details[0].path.toString());
        nForms++;
    }

    while (req.body.levels[nLevels]) {
        const validateLevel = validateLevels(req.body.levels[nLevels]);
        if (validateLevel.error) return res.status(400).send(validateLevel.error.details[0].message + '. PATH: Levels[' + nLevels + '] ' + validateLevel.error.details[0].path.toString());
        nLevels++;
    }

    let childTypification = new ChildTypifications({
        idParent: req.body.idParent,
        name: req.body.name,
        description: req.body.description,
        requirement: req.body.requirement,
        list: req.body.list,
        forms: req.body.forms,
        levels: req.body.levels,
        maxTime: req.body.maxTime
    });
    childTypification = await childTypification.save();
    res.send(childTypification);

});



//'MODIFICAR TIPIFICACIÓN ESPECIFICA' PUT Method
router.put('/:id', auth, async(req, res) => {

    try {//Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validate(req.body);
    if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

    let nForms = 0;
    let nLevels = 0;

    while (req.body.forms[nForms]) {
        const validateForm = validateForms(req.body.forms[nForms]);
        if (validateForm.error) return res.status(400).send(validateForm.error.details[0].message + '. PATH: Forms[' + nForms + '] ' + validateForm.error.details[0].path.toString());
        nForms++;
    }

    while (req.body.levels[nLevels]) {
        const validateLevel = validateLevels(req.body.levels[nLevels]);
        if (validateLevel.error) return res.status(400).send(validateLevel.error.details[0].message + '. PATH: Levels[' + nLevels + '] ' + validateLevel.error.details[0].path.toString());
        nLevels++;
    }


    const childTypification = await ChildTypifications.findByIdAndUpdate(req.params.id, {
        idParent: req.body.idParent,
        name: req.body.name,
        description: req.body.description,
        requirement: req.body.requirement,
        list: req.body.list,
        forms: req.body.forms,
        levels: req.body.levels,
        maxTime: req.body.maxTime
    }, {
        new: true
    });

    //If not existing, return 404 - Not Found
    if (!childTypification) return res.status(404).send('Tipificación Especifica no encontrada'); // Error 404 

    res.send(childTypification);}
    catch (ex) {
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :(' })
    }
});


module.exports = router;