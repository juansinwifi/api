const auth = require('../middleware/auth');
const {Profiles, validateProfile, validateProfileTypifications, countPermissions} = require('../models/Profiles');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Joi = require('joi'); //Validacion de Inputs en el servicio
const _ = require('lodash');


/*********** */
/* PERFILES */
/************/

//'BUSCAR PERFILES' GET Method
router.get('/', auth, async (req, res) => {
    try {
    const profiles = await Profiles.find().sort('name');
    res.send(profiles);
    }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    }
});

//'BUSCAR UN PERFIL ESPECIFICO' GET Method
router.get('/:id', auth, async (req, res) => {
    try{
        //Look up the Profiles
        //If not existing, return 404 - Not Found
        const profiles = await Profiles.findById(req.params.id);
        if (!profiles) return res.status(404).send('Perfil no encontrado'); // Error 404 
        res.send(profiles);
    }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    }
});

//'CREAR PERFILES' POST Method
router.post('/', auth, async (req, res) => {
    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validateProfile(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const fail = validateProfileTypifications(req.body.typifications);
    if (fail.error) return res.status(400).send(JSON.stringify(fail.error._object) + ' ' + fail.error.details[0].message);

    const nPermits = countPermissions(req.body);

    let profile = new Profiles({
        type: req.body.type,
        permissions: req.body.permissions,
        total: nPermits,
        requirements: req.body.requirements,
        profiles: req.body.profiles,
        areas: req.body.areas,
        users: req.body.users,
        typifications: { enable: req.body.typifications.enable, available: req.body.typifications.available },
        case: req.body.case,
        channel: req.body.channel,
        contact: req.body.contact,
        lights: req.body.lights,
        rejection: req.body.rejection
    });
   
    profile = await profile.save();
    res.send(profile);
});

//'MODIFICAR PERFILES' PUT Method
router.put('/:id', auth, async (req, res) => {
    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validateProfile(req.body);
    //if (error) return res.status(400).send(error.details[0].message);
    if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

    const profile = await Profiles.findByIdAndUpdate(req.params.id,_.pick(
        req.body, ['type', 'permissions', 'total', 'requirements', 'profiles', 'areas', 'users',  'typifications','case','channel', 'contact', 'lights', 'rejection'  ])
    ,{
        new: true
    });

    //If not existing, return 404 - Not Found
    if (!profile) return res.status(404).send('Perfil no encontrado'); // Error 404 

    //Return the updated course
    res.send(profile);

});

module.exports = router;