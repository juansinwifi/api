const Joi = require('joi'); //Validacion de Inputs en el servicio
const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json()); //Lee entradas en formato json
app.use(cors());

/* DENTIX API */
/* Elaborardo: Sebastian Otero - B612 Technologies s.a.s */
/* Versión: 08-09-2018 */

/**************** */
/* REQUERIMIENTOS */
/******************/

const requirements = [
    { id: 1, type: 'Consulta', sms: 'True', written: 'False', medium: 'Email', times: 'Inmediato', days: '0', hours: '0' },
    { id: 2, type: 'Peticion', sms: 'True', written: 'True', medium: 'Email', times: 'Fecha de Apertura', days: '13', hours: '0' },
    { id: 3, type: 'Queja', sms: 'True', written: 'False', medium: 'Fisico', times: 'Fecha de Seguimiento', days: '2', hours: '3' }
];

//'BUSCAR REQUERIMIENTOS' GET Method
app.get('/api/admin/requirements', (req, res) => {
    res.send(requirements);
});

//'CREAR REQUERIMIENTO' POST Method  
app.post('/api/admin/requirements', (req, res) => {
    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validateRequiement(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const requirement = {
        id: requirements.length + 1,
        type: req.body.type,
        sms: req.body.sms,
        written: req.body.written,
        medium: req.body.medium,
        times: req.body.times,
        days: req.body.days,
        hours: req.body.hours
    };
    requirements.push(requirement);
    res.send(requirement);
});

//'MODIFICAR REQUERIMIENTO' PUT Method   
app.put('/api/admin/requirements/:id', (req, res) => {
    //Look up the requierement
    //If not existing, return 404 - Not Found
    const requierement = requirements.find(r => r.id === parseInt(req.params.id));
    if (!requierement) return res.status(404).send('Requerimiento no encontrado'); // Error 404 

    //Validate
    //If invalid, return 404 - Bad Request
    const { error } = validateRequiement(req.body);
    if (error) return res.status(400).send(error.details[0].message);


    //Update Requierments

    requierement.type = req.body.type;
    requierement.sms = req.body.sms;
    requierement.written = req.body.written;
    requierement.medium = req.body.medium;
    requierement.times = req.body.times;
    requierement.days = req.body.days;
    requierement.hours = req.body.hours;

    //Return the updated course
    res.send(requierement);
});

//Funcion de Validación de Campos del Requirimieto
function validateRequiement(requiement) {

    const schema = {
        type: Joi.string().min(3).required(),
        sms: Joi.boolean().required(),
        written: Joi.boolean().required(),
        medium: Joi.string().min(3).required(),
        times: Joi.string().min(3).required(),
        days: Joi.number().integer().required(),
        hours: Joi.number().integer().required()

    };

    return Joi.validate(requiement, schema);
}


/*********** */
/* PERFILES */
/************/
const typifications = [
    { id: 1, name: 'ACUERDO DE PAGO', custom: 'La la la' },
    { id: 2, name: 'NOVEDADES MONETARIAS', custom: 'Do Re Mi Fa' }
];

const profiles = [
    { id: 1, type: 'CONSULTA', permissions: 'R', requirements: 'True', profiles: 'True', areas: 'True', users: 'True', typifications: { enable: 'True', available: {} }, case: 'True', channel: 'True', contact: 'True', lights: 'True', rejection: 'True' },
    { id: 2, type: 'RADICADOR', permissions: 'W', requirements: 'True', profiles: 'True', areas: 'True', users: 'True', typifications: { enable: 'False', available: {} }, case: 'True', channel: 'True', contact: 'True', lights: 'True', rejection: 'True' },
    { id: 3, type: 'EJECUTOR', permissions: 'W', requirements: 'True', profiles: 'False', areas: 'False', users: 'True', typifications: { enable: 'False', available: {} }, case: 'True', channel: 'True', contact: 'True', lights: 'True', rejection: 'True' }
];



//'BUSCAR PERFILES' GET Method
app.get('/api/admin/profiles', (req, res) => {
    res.send(profiles);
});

//'CREAR PERFILES' POST Method
app.post('/api/admin/profiles', (req, res) => {
    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validateProfile(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const fail = validateProfileTypifications(req.body.typifications);
    if (fail.error) return res.status(400).send(  JSON.stringify(fail.error._object) + ' ' + fail.error.details[0].message);
   

    const profile = {
        id: profiles.length + 1,
        type: req.body.type,
        permissions: req.body.permissions,
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
    };
    profiles.push(profile);
    res.send(profile);
});

//'MODIFICAR PERFILES' PUT Method
app.put('/api/admin/profiles/:id', (req, res) => {
    //Look up the requierement
    //If not existing, return 404 - Not Found
    const profile = profiles.find(p => p.id === parseInt(req.params.id));
    if (!profile) return res.status(404).send('Perfil no encontrado'); // Error 404 

    //Validate
    //If invalid, return 404 - Bad Request
    const { error } = validateProfile(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const fail = validateProfileTypifications(req.body.typifications);
    if (fail.error) return res.status(400).send(  JSON.stringify(fail.error._object) + ' ' + fail.error.details[0].message);
   
    //Update Requierments
    profile.type = req.body.type;
    profile.permissions = req.body.permissions;
    profile.requirements = req.body.requirements;
    profile.profiles = req.body.profiles;
    profile.areas = req.body.areas;
    profile.users = req.body.users;
    profile.typifications.enable = req.body.typifications.enable;
    if (profile.typifications.enable == 'True') available = req.body.typifications.available;
    profile.case = req.body.case;
    profile.channel = req.body.channel;
    profile.contact = req.body.contact;
    profile.lights = req.body.lights;
    profile.rejection = req.body.rejection;
    
    //Return the updated course
    res.send(profile);
});

//Funcion de Validación de Campos del Perfil
function validateProfile(requiement) {

    const schema = {
        type: Joi.string().min(3).required(),
        permissions: Joi.string().max(1).empty(' ').required(),
        requirements: Joi.boolean().required(),
        profiles: Joi.boolean().required(),
        areas: Joi.boolean().required(),
        users: Joi.boolean().required(),
        typifications: Joi.object().required(),
        case: Joi.boolean().required(),
        channel: Joi.boolean().required(),
        contact: Joi.boolean().required(),
        lights: Joi.boolean().required(),
        rejection: Joi.boolean().required()
    };


    return Joi.validate(requiement, schema);
}

//Funcion de Validación de Campos de Tipificación en el Perfil
function validateProfileTypifications(requiement) {

        const schema = {
                enable: Joi.boolean().required()
        };

        if (requiement.enable == 'True') schema.available =  Joi.array().items(Joi.number().required()).required()
       

        return Joi.validate(requiement, schema);
}



const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));