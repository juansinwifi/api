const auth = require('../middleware/auth');
const {Cases, validate} = require('../models/case');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();


/*********************/
/* Gestión de Casos */
/*******************/

//'BUSCAR CASOS' GET Method
router.get('/', auth, async (req, res) => {
    const myCases = await Cases.find().sort('name');
    res.send(myCases);
});

//'BUSCAR UN CASO ESPECIFICO' GET Method
router.get('/:id', auth, async (req, res) => {
    try{
        //Buscar un  caso especifico
        //Si no existe, return 404 - Not Found
        const myCase = await Cases.findById(req.params.id);
        if (!myCase) return res.status(404).send('Gestión no encontrada'); // Error 404 
        res.send(myCase);
    }
    catch (ex){
        res.status(500).send('Algo salio mal :(')
    }
});

//'CREAR CASOS' POST Method
router.post('/', auth, async (req, res) => {
    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validate(req.body);
    if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

    let myCase = new Cases({
        name: req.body.name,
        description: req.body.description,
        rejection: req.body.rejection
    });
    myCase = await myCase.save();
    res.send(myCase);
});

//'MODIFICAR CASO' PUT Method
router.put('/:id', auth, async (req, res) => {
    //Look up the requierement

    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validate(req.body);
    //if (error) return res.status(400).send(error.details[0].message);
    if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

   const myCase = await Cases.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        description: req.body.description,
        rejection: req.body.rejection
    },{
        new: true
    });

    //If not existing, return 404 - Not Found
    if (!myCase) return res.status(404).send('Gestión no encontrado'); // Error 404 

    //Return the updated course
    res.send(myCase);
});


module.exports = router;