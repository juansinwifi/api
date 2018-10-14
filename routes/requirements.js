const express = require('express');
const router = express.Router();

/**************** */
/* REQUERIMIENTOS */
/******************/

const requirements = [
    { id: 1, type: 'Consulta', sms: true, written: false, medium: 'Email', times: 'Inmediato', days: '0', hours: '0' },
    { id: 2, type: 'Peticion', sms: true, written: true, medium: 'Email', times: 'Fecha de Apertura', days: '13', hours: '0' },
    { id: 3, type: 'Queja', sms: true, written: false, medium: 'Fisico', times: 'Fecha de Seguimiento', days: '2', hours: '3' }
];

//'BUSCAR REQUERIMIENTOS' GET Method
router.get('/', (req, res) => {
    res.send(requirements);
});

//'BUSCAR UN REQUERIMIENTO ESPECIFICO' GET Method
router.get('/:id', (req, res) => {
    //Look up the requierement
    //If not existing, return 404 - Not Found
    const requirement = requirements.find(r => r.id === parseInt(req.params.id));
    if (!requirement) return res.status(404).send('Requerimiento no encontrado'); // Error 404 
    res.send(requirement);
});

//'CREAR REQUERIMIENTO' POST Method  
router.post('/', (req, res) => {
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
router.put('/:id', (req, res) => {
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

module.exports = router;