const auth = require('../middleware/auth');
const {Contacts, validate} = require('../models/contacts');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Joi = require('joi'); //Validacion de Inputs en el servicio


/*************/
/* CONTACTS */
/************/

const xxx = [
    {  name: 'Titular' },
    {  name: 'Paciente' },
    {  name: 'Clinica' }
];

//'BUSCAR Canal de Comunicaciones' GET Method
router.get('/', auth, async (req, res) => {
    try {
        const contacts = await Contacts.find().sort('name');
        res.send(contacts);
        }
        catch(ex){
            console.log(ex);
            res.status(500).send({ 'Error': 'Algo salio mal :('});
        }
});


//'BUSCAR UN Canal de Comunicaciones ESPECIFICO' GET Method
router.get('/:id', auth, async (req, res) => {
    try{
        //Look up the Profiles
        //If not existing, return 404 - Not Found
        const contact = await Contacts.findOne({"user._id": req.params.id});
        if (!contact) return res.status(404).send('Tipo de contacto no encontrado'); // Error 404 
        res.send(contact);
    }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    }
});

//'CREAR Contacto' POST Method
router.post('/', auth, async (req, res) => {

    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let contact = new Contacts({
        name: req.body.name
    });
   
    contact = await contact.save();
    res.send(contact);
});

//'MODIFICAR Contacto' PUT Method
router.put('/:id', auth, async (req, res) => {

    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validate(req.body);
    //if (error) return res.status(400).send(error.details[0].message);
    if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

   const contact = await Contacts.findByIdAndUpdate(req.params.id, {
        name: req.body.name
    },{
        new: true
    });

    //If not existing, return 404 - Not Found
    if (!contact) return res.status(404).send('Tipo de contacto no encontrado'); // Error 404 

    //Return the updated course
    res.send(contact);
   
});

module.exports = router;