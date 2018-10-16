const express = require('express');
const router = express.Router();
const Joi = require('joi'); //Validacion de Inputs en el servicio

/***************** */
/* TIPIFICACIONES */
/******************/
const typifications = [
    { id: 1, name: 'ACUERDO DE PAGO' },
    { id: 2, name: 'NOVEDADES MONETARIAS' }
];

const childTypifications = [
    { id: 1, idParent: 1, name: 'REDIFERIDO', description: 'Acuerdo de pago en un nuevo numero de cuotas', requirement: 1 , forms: [{ id: 1, description: 'Numero de Cuotas', type: 2 }, { id: 2, description: 'Valor Cuota', type: 3 }], levels: [{ id: 1, area: 1, user: 2, profile: 2, days: 2, hours: 5 }], maxTime: 21 },
    { id: 2, idParent: 2, name: 'CAMBIO DE CICLO', description: 'Novedad de nueva fecha de pagos', requirement: 2,  forms: [{ id: 1, description: 'Nuevas Fechas de Pago', type: 4 }], levels: [{ id: 1, area: 2, user: 1, profile: 3, days: 5, hours: 8 }, { id: 2, area: 1, user: 1, profile: 1, days: 1, hours: 0 }], maxTime: 56 },
];

const varTypes = [
    { id: 1, name: 'texto', type: 'string' },
    { id: 2, name: 'Numero', type: 'number' },
    { id: 3, name: 'Moneda', type: 'number' },
    { id: 4, name: 'Fecha', type: 'date' }
];

//'BUSCAR TIPIFICACIONES' GET Method
router.get('/api/admin/typifications', (req, res) => {
    res.send(typifications);
});

//'BUSCAR UNA TIPIFICACION ' GET Method
router.get('/api/admin/typifications/:id', (req, res) => {
    //Look up the requierement
    //If not existing, return 404 - Not Found
    const typification = typifications.find(t => t.id === parseInt(req.params.id));
    if (!typification) return res.status(404).send('Tipificación no encontrada'); // Error 404 
    res.send(typification);
});

//'BUSCAR TIPIFICACIONES ESPECIFICAS' GET Method
router.get('/api/admin/childtypifications', (req, res) => {
    res.send(childTypifications);
});

//'BUSCAR UNA TIPIFICACION ESPECIFICA' GET Method
router.get('/api/admin/childtypifications/:id', (req, res) => {
    //Look up the Child Typification
    //If not existing, return 404 - Not Found
    const child = childTypifications.find(c => c.id === parseInt(req.params.id));
    if (!child) return res.status(404).send('Tipificación Especifica no encontrada'); // Error 404 
    res.send(child);
});

//'BUSCAR TIPOS DE VARIABLES' GET Method
router.get('/api/admin/vartypes', (req, res) => {
    res.send(varTypes);
});

//'BUSCAR UNA TIPO DE VARIABLE' GET Method
router.get('/api/admin/vartypes/:id', (req, res) => {
    //Look up the varTypes
    //If not existing, return 404 - Not Found
    const varType = varTypes.find(v => v.id === parseInt(req.params.id));
    if (!varType) return res.status(404).send('Tipo de Variable no encontrada'); // Error 404 
    res.send(varType);
});

//'CREAR TIPIFICACIÓN' POST Method
router.post('/api/admin/typifications', (req, res) => {
    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validateTypifications(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const typification = {
        id: typifications.length + 1,
        name: req.body.name
    };
    typifications.push(typification);
    res.send(typification);
});

//'CREAR TIPIFICACIÓN ESPECIFICAS' POST Method
router.post('/api/admin/childtypifications', (req, res) => {
    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validateChildTypifications(req.body);
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

    const childTypification = {
        id: childTypifications.length + 1,
        idParent: req.body.idParent,
        name: req.body.name,
        description: req.body.description,
        requirement: req.body.requirement,
        forms: req.body.forms,
        levels: req.body.levels,
        maxTime: req.body.maxTime
    };

    childTypifications.push(childTypification);
    res.send(childTypification);
});

//'MODIFICAR TIPIFICACIÓN' PUT Method
router.put('/api/admin/typifications/:id', (req, res) => {
    //Look up the data
    //If not existing, return 404 - Not Found
    const typification = typifications.find(t => t.id === parseInt(req.params.id));
    if (!typification) return res.status(404).send('Tipificación no encontrada'); // Error 404 

    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validateTypifications(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //Update Typification
    typification.name = req.body.name;

    //Return the updated course
    res.send(typification);
});

//'MODIFICAR TIPIFICACIÓN ESPECIFICA' PUT Method
router.put('/api/admin/childtypifications/:id', (req, res) => {
    //Look up the data
    //If not existing, return 404 - Not Found
    const childTypification = childTypifications.find(c => c.id === parseInt(req.params.id));
    if (!childTypification) return res.status(404).send('Tipificación Especifica no encontrada'); // Error 404 

    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validateChildTypifications(req.body);
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

    //Update Child Typification
    childTypification.idParent = req.body.idParent,
        childTypification.name = req.body.name,
        childTypification.description = req.body.description,
        childTypification.requirement = req.body.requirement,
        childTypification.forms = req.body.forms,
        childTypification.levels = req.body.levels,
        childTypification.maxTime = req.body.maxTime

    //Return the Typification
    res.send(childTypification);
});
//Funcion de Validación de Campos del Tipificaciones
function validateTypifications(requiement) {

    const schema = {
        name: Joi.string().min(3).required()
    };

    return Joi.validate(requiement, schema);
}

//Funcion de Validación de Campos del Tipificaciones Especificas
function validateChildTypifications(requiement) {

    //Para los niveles el ID debe ser menos de 10. 
    const schema = {
        idParent: Joi.number().min(1).required(),
        name: Joi.string().min(3).required(),
        description: Joi.string().required(),
        requirement: Joi.number().min(1).required(),
        forms: Joi.array().items(Joi.object()).min(1).required(),
        levels: Joi.array().items(Joi.object()).min(1).required(),
        maxTime: Joi.number().min(1).required()
    };

    return Joi.validate(requiement, schema);
}

//Funcion de Validación de Campos del Formulario
function validateForms(requiement) {

    const schema = {
        description: Joi.string().min(2).required(),
        type: Joi.number().min(1).required()
    };

    return Joi.validate(requiement, schema);
}

//Funcion de Validación de Campos del Niveles
function validateLevels(requiement) {

    const schema = {
        area: Joi.number().required(),
        user: Joi.number().required(),
        profile: Joi.number().required(),
        days: Joi.number().max(24).required(),
        hours: Joi.number().max(24).required()
    };

    return Joi.validate(requiement, schema);
}

module.exports = router;