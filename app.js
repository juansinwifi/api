const Joi = require('joi'); //Validacion de Inputs en el servicio
const express = require('express');
const app = express();
var cors = require('cors');
app.use(express.json()); //Lee entradas en formato json
app.use(cors());


/* DENTIX API */
/* Elaborardo: Sebastian Otero - B612 Technologies S.A.S */
/* Versión: 08-09-2018 */

/**************** */
/* REQUERIMIENTOS */
/******************/

const requirements = [
    { id: 1, type: 'Consulta', sms: true, written: false, medium: 'Email', times: 'Inmediato', days: '0', hours: '0' },
    { id: 2, type: 'Peticion', sms: true, written: true, medium: 'Email', times: 'Fecha de Apertura', days: '13', hours: '0' },
    { id: 3, type: 'Queja', sms: true, written: false, medium: 'Fisico', times: 'Fecha de Seguimiento', days: '2', hours: '3' }
];

//'BUSCAR REQUERIMIENTOS' GET Method
app.get('/api/admin/requirements', (req, res) => {
    res.send(requirements);
});

//'BUSCAR UN REQUERIMIENTO ESPECIFICO' GET Method
app.get('/api/admin/requirements/:id', (req, res) => {
    //Look up the requierement
    //If not existing, return 404 - Not Found
    const requirement = requirements.find(r => r.id === parseInt(req.params.id));
    if (!requirement) return res.status(404).send('Requerimiento no encontrado'); // Error 404 
    res.send(requirement);
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

/***************** */
/* TIPIFICACIONES */
/******************/
const typifications = [
    { id: 1, name: 'ACUERDO DE PAGO' },
    { id: 2, name: 'NOVEDADES MONETARIAS' }
];

const childTypifications = [
    { id: 1, idParent: 1, name: 'REDIFERIDO', description: 'Acuerdo de pago en un nuevo numero de cuotas', forms: [{ id: 1, description: 'Numero de Cuotas', type: 2 }, { id: 2, description: 'Valor Cuota', type: 3 }], levels: [{ id: 1, area: 1, user: 2, profile: 2, days: 2, hours: 5 }], maxTime: 21 },
    { id: 2, idParent: 2, name: 'CAMBIO DE CICLO', description: 'Novedad de nueva fecha de pagos', forms: [{ id: 1, description: 'Nuevas Fechas de Pago', type: 4 }], levels: [{ id: 1, area: 2, user: 1, profile: 3, days: 5, hours: 8 }, { id: 2, area: 1, user: 1, profile: 1, days: 1, hours: 0 }], maxTime: 56 },
];

const varTypes = [
    { id: 1, name: 'texto', type: 'string' },
    { id: 2, name: 'Numero', type: 'number' },
    { id: 3, name: 'Moneda', type: 'number' },
    { id: 4, name: 'Fecha', type: 'date' }
];

//'BUSCAR TIPIFICACIONES' GET Method
app.get('/api/admin/typifications', (req, res) => {
    res.send(typifications);
});

//'BUSCAR UNA TIPIFICACION ' GET Method
app.get('/api/admin/typifications/:id', (req, res) => {
    //Look up the requierement
    //If not existing, return 404 - Not Found
    const typification = typifications.find(t => t.id === parseInt(req.params.id));
    if (!typification) return res.status(404).send('Tipificación no encontrada'); // Error 404 
    res.send(typification);
});

//'BUSCAR TIPIFICACIONES ESPECIFICAS' GET Method
app.get('/api/admin/childtypifications', (req, res) => {
    res.send(childTypifications);
});

//'BUSCAR UNA TIPIFICACION ESPECIFICA' GET Method
app.get('/api/admin/childtypifications/:id', (req, res) => {
    //Look up the Child Typification
    //If not existing, return 404 - Not Found
    const child = childTypifications.find(c => c.id === parseInt(req.params.id));
    if (!child) return res.status(404).send('Tipificación Especifica no encontrada'); // Error 404 
    res.send(child);
});

//'BUSCAR TIPOS DE VARIABLES' GET Method
app.get('/api/admin/vartypes', (req, res) => {
    res.send(varTypes);
});

//'BUSCAR UNA TIPO DE VARIABLE' GET Method
app.get('/api/admin/vartypes/:id', (req, res) => {
    //Look up the varTypes
    //If not existing, return 404 - Not Found
    const varType = varTypes.find(v => v.id === parseInt(req.params.id));
    if (!varType) return res.status(404).send('Tipo de Variable no encontrada'); // Error 404 
    res.send(varType);
});

//'CREAR TIPIFICACIÓN' POST Method
app.post('/api/admin/typifications', (req, res) => {
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
app.post('/api/admin/childtypifications', (req, res) => {
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
        forms: req.body.forms,
        levels: req.body.levels,
        maxTime: req.body.maxTime
    };

    childTypifications.push(childTypification);
    res.send(childTypification);
});

//'MODIFICAR TIPIFICACIÓN' PUT Method
app.put('/api/admin/typifications/:id', (req, res) => {
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
app.put('/api/admin/childtypifications/:id', (req, res) => {
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



/*********** */
/* PERFILES */
/************/

const profiles = [
    { id: 1, type: 'CONSULTA', permissions: 'R', total: 10, requirements: true, profiles: true, areas: true, users: true, typifications: { enable: true, available: [1, 2] }, case: true, channel: true, contact: true, lights: true, rejection: true },
    { id: 2, type: 'RADICADOR', permissions: 'W', total: 9, requirements: true, profiles: true, areas: true, users: true, typifications: { enable: false, available: [] }, case: true, channel: true, contact: true, lights: true, rejection: true },
    { id: 3, type: 'EJECUTOR', permissions: 'W', total: 7, requirements: true, profiles: false, areas: false, users: true, typifications: { enable: false, available: [] }, case: true, channel: true, contact: true, lights: true, rejection: true }
];


//'BUSCAR PERFILES' GET Method
app.get('/api/admin/profiles', (req, res) => {
    res.send(profiles);
});

//'BUSCAR UN PERFIL ESPECIFICO' GET Method
app.get('/api/admin/profiles/:id', (req, res) => {
    //Look up the requierement
    //If not existing, return 404 - Not Found
    const profile = profiles.find(p => p.id === parseInt(req.params.id));
    if (!profile) return res.status(404).send('Perfil no encontrado'); // Error 404 
    res.send(profile);
});

//'CREAR PERFILES' POST Method
app.post('/api/admin/profiles', (req, res) => {
    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validateProfile(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const fail = validateProfileTypifications(req.body.typifications);
    if (fail.error) return res.status(400).send(JSON.stringify(fail.error._object) + ' ' + fail.error.details[0].message);

    const nPermits = countPermissions(req.body);

    const profile = {
        id: profiles.length + 1,
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
    if (fail.error) return res.status(400).send(JSON.stringify(fail.error._object) + ' ' + fail.error.details[0].message);

    const nPermits = countPermissions(req.body);

    //Update Requierments
    profile.type = req.body.type;
    profile.permissions = req.body.permissions;
    profile.total = nPermits,
        profile.requirements = req.body.requirements;
    profile.profiles = req.body.profiles;
    profile.areas = req.body.areas;
    profile.users = req.body.users;
    profile.typifications.enable = req.body.typifications.enable;
    if (profile.typifications.enable == true) available = req.body.typifications.available;
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

    if (requiement.enable == true) schema.available = Joi.array().items(Joi.number().required()).required()


    return Joi.validate(requiement, schema);
}

//Cuenta el numero de Permisos que tiene (# Trues)
function countPermissions(requiement) {

    let countPermissions = 0

    if (requiement.requirements) countPermissions++;
    if (requiement.profiles) countPermissions++;
    if (requiement.areas) countPermissions++;
    if (requiement.users) countPermissions++;
    if (requiement.typifications.enable) countPermissions++;
    if (requiement.case) countPermissions++;
    if (requiement.channel) countPermissions++;
    if (requiement.contact) countPermissions++;
    if (requiement.lights) countPermissions++;
    if (requiement.rejection) countPermissions++;

    return countPermissions;
}

/**********/
/* Areas */
/*********/

const areas = [{
        id: 1,
        name: "OPERACIONES",
        attention: {
            mon: { check: true, start: { h: 7, m: 0 }, fin: { h: 17, m: 0 } },
            tue: { check: true, start: { h: 7, m: 0 }, fin: { h: 17, m: 0 } },
            wed: { check: true, start: { h: 7, m: 0 }, fin: { h: 17, m: 0 } },
            thu: { check: true, start: { h: 7, m: 0 }, fin: { h: 17, m: 0 } },
            fri: { check: true, start: { h: 7, m: 0 }, fin: { h: 17, m: 0 } },
            sat: { check: false, start: { h: 0, m: 0 }, fin: { h: 0, m: 0 } },
            sun: { check: false, start: { h: 0, m: 0 }, fin: { h: 0, m: 0 } },
        },
        leader: "Pedro Ficticio",
        email: "pficticio@dentix.com"
    },
    {
        id: 2,
        name: "CLINICA  CALLE 90",
        attention: {
            mon: { check: true, start: { h: 7, m: 0 }, fin: { h: 17, m: 0 } },
            tue: { check: true, start: { h: 7, m: 0 }, fin: { h: 17, m: 0 } },
            wed: { check: true, start: { h: 7, m: 0 }, fin: { h: 17, m: 0 } },
            thu: { check: true, start: { h: 7, m: 0 }, fin: { h: 17, m: 0 } },
            fri: { check: true, start: { h: 7, m: 0 }, fin: { h: 17, m: 0 } },
            sat: { check: true, start: { h: 8, m: 0 }, fin: { h: 12, m: 0 } },
            sun: { check: false, start: { h: 0, m: 0 }, fin: { h: 0, m: 0 } },
        },
        leader: "Juan Perez",
        email: "jperez@dentix.com"
    }
];

//'BUSCAR AREAS' GET Method
app.get('/api/admin/areas', (req, res) => {
    res.send(areas);
});

//'BUSCAR UN AREA ESPECIFICA' GET Method
app.get('/api/admin/areas/:id', (req, res) => {
    //Look up the requierement
    //If not existing, return 404 - Not Found
    const area = areas.find(a => a.id === parseInt(req.params.id));
    if (!area) return res.status(404).send('Area no encontrada'); // Error 404 
    res.send(area);
});

//'CREAR AREA' POST Method
app.post('/api/admin/areas', (req, res) => {
    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validateArea(req.body);
    //if (error) return res.status(400).send(error.details[0].message);
    if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

    const area = {
        id: areas.length + 1,
        name: req.body.name,
        attention: {
            mon: { check: req.body.attention.mon.check, start: req.body.attention.start, fin: req.body.attention.fin },
            tue: { check: req.body.attention.tue.check, start: req.body.attention.start, fin: req.body.attention.fin },
            wed: { check: req.body.attention.wed.check, start: req.body.attention.start, fin: req.body.attention.fin },
            thu: { check: req.body.attention.thu.check, start: req.body.attention.start, fin: req.body.attention.fin },
            fri: { check: req.body.attention.fri.check, start: req.body.attention.start, fin: req.body.attention.fin },
            sat: { check: req.body.attention.sat.check, start: req.body.attention.start, fin: req.body.attention.fin },
            sun: { check: req.body.attention.sun.check, start: req.body.attention.start, fin: req.body.attention.fin }
        },
        leader: req.body.leader,
        email: req.body.email
    };
    areas.push(area);
    res.send(area);
});

//'MODIFICAR AREA' PUT Method
app.put('/api/admin/areas/:id', (req, res) => {
    //Look up the requierement
    //If not existing, return 404 - Not Found
    const area = areas.find(a => a.id === parseInt(req.params.id));
    if (!area) return res.status(404).send('Area no encontrada'); // Error 404 

    //Validate
    //If invalid, return 404 - Bad Request
    const { error } = validateArea(req.body);
    if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

    //Update AREA
    area.name = req.body.name;
    area.attention.mon.check = req.body.attention.mon.check;
    area.attention.mon.start = req.body.attention.mon.start;
    area.attention.mon.fin = req.body.attention.mon.fin;
    area.attention.tue.check = req.body.attention.tue.check;
    area.attention.tue.start = req.body.attention.tue.start;
    area.attention.tue.fin = req.body.attention.tue.fin;
    area.attention.wed.check = req.body.attention.wed.check;
    area.attention.wed.start = req.body.attention.wed.start;
    area.attention.wed.fin = req.body.attention.wed.fin;
    area.attention.thu.check = req.body.attention.thu.check;
    area.attention.thu.start = req.body.attention.thu.start;
    area.attention.thu.fin = req.body.attention.thu.fin;
    area.attention.fri.check = req.body.attention.fri.check;
    area.attention.fri.start = req.body.attention.fri.start;
    area.attention.fri.fin = req.body.attention.fri.fin;
    area.attention.sat.check = req.body.attention.sat.check;
    area.attention.sat.start = req.body.attention.sat.start;
    area.attention.sat.fin = req.body.attention.sat.fin;
    area.attention.sun.check = req.body.attention.sun.check;
    area.attention.sun.start = req.body.attention.sun.start;
    area.attention.sun.fin = req.body.attention.sun.fin;
    area.leader = req.body.leader;
    area.email = req.body.email;

    //Return the updated course
    res.send(area);
});

//Funcion de Validación de Campos del Area
function validateArea(requiement) {

    const schema = {
        name: Joi.string().min(3).required(),
        attention: Joi.object().required().keys({
            mon: Joi.object().required().keys({
                check: Joi.boolean().required(),
                start: Joi.object().required().keys({
                    h: Joi.number().max(24).required(),
                    m: Joi.number().max(60).required()
                }),
                fin: Joi.object().required().keys({
                    h: Joi.number().max(24).required(),
                    m: Joi.number().max(60).required()
                })
            }),
            tue: Joi.object().required().keys({
                check: Joi.boolean().required(),
                start: Joi.object().required().keys({
                    h: Joi.number().max(24).required(),
                    m: Joi.number().max(60).required()
                }),
                fin: Joi.object().required().keys({
                    h: Joi.number().max(24).required(),
                    m: Joi.number().max(60).required()
                })
            }),
            wed: Joi.object().required().keys({
                check: Joi.boolean().required(),
                start: Joi.object().required().keys({
                    h: Joi.number().max(24).required(),
                    m: Joi.number().max(60).required()
                }),
                fin: Joi.object().required().keys({
                    h: Joi.number().max(24).required(),
                    m: Joi.number().max(60).required()
                })
            }),
            thu: Joi.object().required().keys({
                check: Joi.boolean().required(),
                start: Joi.object().required().keys({
                    h: Joi.number().max(24).required(),
                    m: Joi.number().max(60).required()
                }),
                fin: Joi.object().required().keys({
                    h: Joi.number().max(24).required(),
                    m: Joi.number().max(60).required()
                })
            }),
            fri: Joi.object().required().keys({
                check: Joi.boolean().required(),
                start: Joi.object().required().keys({
                    h: Joi.number().max(24).required(),
                    m: Joi.number().max(60).required()
                }),
                fin: Joi.object().required().keys({
                    h: Joi.number().max(24).required(),
                    m: Joi.number().max(60).required()
                })
            }),
            sat: Joi.object().required().keys({
                check: Joi.boolean().required(),
                start: Joi.object().required().keys({
                    h: Joi.number().max(24).required(),
                    m: Joi.number().max(60).required()
                }),
                fin: Joi.object().required().keys({
                    h: Joi.number().max(24).required(),
                    m: Joi.number().max(60).required()
                })
            }),
            sun: Joi.object().required().keys({
                check: Joi.boolean().required(),
                start: Joi.object().required().keys({
                    h: Joi.number().max(24).required(),
                    m: Joi.number().max(60).required()
                }),
                fin: Joi.object().required().keys({
                    h: Joi.number().max(24).required(),
                    m: Joi.number().max(60).required()
                })
            })
        }),
        leader: Joi.string().min(3).required(),
        email: Joi.string().email({ minDomainAtoms: 2 }).required()
    };

    return Joi.validate(requiement, schema);
}

/**********/
/* Users */
/*********/

const users = [
    { id: 1, active: true, user: 'pf@dentix.co', password: 'HFK99$$e3#', identification: 1019023277, name: 'Pedro Ficticio', email: 'pedrito.ficticio@gmail.com', phone: "123124", profile: [1, 2], area: 1, country: 'Colombia' },
    { id: 2, active: true, user: 'jf@dentix.co', password: 'HFK99$$e3#', identification: 1020023254, name: 'Juan Ficticio', email: 'juanito.ficticio@outlook.com', phone: "123124", profile: [2], area: 3, country: 'Colombia' },
    { id: 3, active: false, user: 'af@dentix.co', password: 'HFK99$$e3#', identification: 1018041188, name: 'Alejandra Ficticia', email: 'aleja.ficticia@gmail.com', phone: "123124", profile: [1, 2, 3], area: 2, country: 'Colombia' }
];

//'BUSCAR USUARIOS' GET Method
app.get('/api/admin/users', (req, res) => {
    res.send(users);
});

//Traer los perfiles del servicio Profiles
//Traer las areas del servicio Areas

//'BUSCAR UN USUARIP ESPECIFICO' GET Method
app.get('/api/admin/users/:id', (req, res) => {
    //Look up the requierement
    //If not existing, return 404 - Not Found
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).send('Usuario no encontrado'); // Error 404 
    res.send(user);
});

//'CREAR USUARIO' POST Method
app.post('/api/admin/users', (req, res) => {
    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validateUser(req.body);
    //if (error) return res.status(400).send(error.details[0].message);
    if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

    const user = {
        id: users.length + 1,
        active: req.body.active,
        user: req.body.user,
        password: req.body.password,
        identification: req.body.identification,
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        profile: req.body.profile,
        area: req.body.area,
        conuntry: req.body.country
    };
    users.push(user);
    res.send(user);
});

//'MODIFICAR AREA' PUT Method
app.put('/api/admin/users/:id', (req, res) => {
    //Look up the requierement
    //If not existing, return 404 - Not Found
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).send('Usuario no encontrado'); // Error 404 

    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validateUser(req.body);
    //if (error) return res.status(400).send(error.details[0].message);
    if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

    //Update AREA
    user.active = req.body.active;
    user.user = req.body.user;
    user.password = req.body.password;
    user.identification = req.body.identification;
    user.name = req.body.name;
    user.email = req.body.email;
    user.phone = req.body.phone;
    user.profile = req.body.profile;
    user.area = req.body.area;
    user.country = req.body.country;

    //Return the updated course
    res.send(user);
});

//Funcion de Validación de Campos de Usuario
function validateUser(requiement) {

    const schema = {
        active: Joi.boolean().required(),
        user: Joi.string().email({ minDomainAtoms: 2 }).required(),
        password: Joi.string().required(),
        identification: Joi.number().required(),
        name: Joi.string().min(3).required(),
        email: Joi.string().email({ minDomainAtoms: 2 }).required(),
        phone: Joi.number().min(7).required(),
        profile: Joi.array().items(Joi.number()).min(1).required(),
        area: Joi.number().min(1).required(),
        country: Joi.string().min(3).required()
    };

    return Joi.validate(requiement, schema);
}

/**********/
/* CASES */
/*********/

const cases = [
    { id: 1, name: 'RECHAZAR- DEVOLVER', description: 'Se devuelve el caso al usuario anterior', rejection: true },
    { id: 2, name: 'FINALIZAR - AVANZAR', description: 'Avanzar al siguiente nivel, si es el último, se caso se marca como finalizado', rejection: false },
    { id: 3, name: 'EN GESTION', description: 'Cuando este pedte rsta para gestionar Incluir fecha de seguimiento', rejection: false }
];

//'BUSCAR CASOS' GET Method
app.get('/api/admin/cases', (req, res) => {
    res.send(cases);
});

//Traer los perfiles del servicio Profiles
//Traer las areas del servicio Areas

//'BUSCAR UN CASO ESPECIFICO' GET Method
app.get('/api/admin/cases/:id', (req, res) => {
    //Look up the requierement
    //If not existing, return 404 - Not Found
    const myCase = cases.find(c => c.id === parseInt(req.params.id));
    if (!myCase) return res.status(404).send('Gestión no encontrada'); // Error 404 
    res.send(myCase);
});

//'CREAR CASOS' POST Method
app.post('/api/admin/cases', (req, res) => {
    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validateCase(req.body);
    //if (error) return res.status(400).send(error.details[0].message);
    if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

    const myCase = {
        id: cases.length + 1,
        name: req.body.name,
        description: req.body.description,
        rejection: req.body.rejection
    };
    cases.push(myCase);
    res.send(myCase);
});

//'MODIFICAR CASO' PUT Method
app.put('/api/admin/cases/:id', (req, res) => {
    //Look up the requierement
    //If not existing, return 404 - Not Found
    const myCase = cases.find(c => c.id === parseInt(req.params.id));
    if (!myCase) return res.status(404).send('Gestión no encontrado'); // Error 404 

    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validateCase(req.body);
    //if (error) return res.status(400).send(error.details[0].message);
    if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

    //Update AREA
    myCase.name = req.body.name;
    myCase.description = req.body.description;
    myCase.rejection = req.body.rejection;


    //Return the updated course
    res.send(myCase);
});

//Funcion de Validación de Campos de Casos
function validateCase(requiement) {

    const schema = {
        name: Joi.string().min(3).required(),
        description: Joi.string().min(3).required(),
        rejection: Joi.boolean().required()
    };

    return Joi.validate(requiement, schema);
}

/******************/
/* COMMUNICATION CHANNEL */
/****************/

const channels = [
    { id: 1, name: 'Presencial' },
    { id: 2, name: 'inbound' },
    { id: 3, name: 'outbound' }
];

//'BUSCAR Canal de Comunicaciones' GET Method
app.get('/api/admin/channels', (req, res) => {
    res.send(channels);
});


//'BUSCAR UN Canal de Comunicaciones ESPECIFICO' GET Method
app.get('/api/admin/channels/:id', (req, res) => {
    //Look up the requierement
    //If not existing, return 404 - Not Found
    const channel = channels.find(c => c.id === parseInt(req.params.id));
    if (!channel) return res.status(404).send('Canal de Comunicaciones no encontrada'); // Error 404 
    res.send(channel);
});

//'CREAR Canal de Comunicaciones' POST Method
app.post('/api/admin/channels', (req, res) => {
    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validateChannel(req.body);
    //if (error) return res.status(400).send(error.details[0].message);
    if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

    const channel = {
        id: channels.length + 1,
        name: req.body.name
    };
    channels.push(channel);
    res.send(channel);
});

//'MODIFICAR Canal de Comunicaciones' PUT Method
app.put('/api/admin/channels/:id', (req, res) => {
    //Look up the requierement
    //If not existing, return 404 - Not Found
    const channel = channels.find(c => c.id === parseInt(req.params.id));
    if (!channel) return res.status(404).send('Canal de Comunicaciones no encontrada'); // Error 404 

    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validateChannel(req.body);
    //if (error) return res.status(400).send(error.details[0].message);
    if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

    //Update AREA
    channel.name = req.body.name;
    channel.description = req.body.description;
    channel.rejection = req.body.rejection;


    //Return the updated course
    res.send(channel);
});

//Funcion de Validación de Campos de Casos
function validateChannel(requiement) {

    const schema = {
        name: Joi.string().min(3).required()
    };

    return Joi.validate(requiement, schema);
}

/**************************/
/* CONTACTS */
/************************/

const contacts = [
    { id: 1, name: 'Titular' },
    { id: 2, name: 'Paciente' },
    { id: 3, name: 'Clinica' }
];

//'BUSCAR Canal de Comunicaciones' GET Method
app.get('/api/admin/contacts', (req, res) => {
    res.send(contacts);
});


//'BUSCAR UN Canal de Comunicaciones ESPECIFICO' GET Method
app.get('/api/admin/contacts/:id', (req, res) => {
    //Look up the requierement
    //If not existing, return 404 - Not Found
    const contact = contacts.find(c => c.id === parseInt(req.params.id));
    if (!contact) return res.status(404).send('Contacto no encontrado'); // Error 404 
    res.send(contact);
});

//'CREAR Contacto' POST Method
app.post('/api/admin/contacts', (req, res) => {
    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validateContact(req.body);
    //if (error) return res.status(400).send(error.details[0].message);
    if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

    const contact = {
        id: contacts.length + 1,
        name: req.body.name
    };
    contacts.push(contact);
    res.send(contact);
});

//'MODIFICAR Contacto' PUT Method
app.put('/api/admin/contacts/:id', (req, res) => {
    //Look up the requierement
    //If not existing, return 404 - Not Found
    const contact = contacts.find(c => c.id === parseInt(req.params.id));
    if (!contact) return res.status(404).send('Contacto no encontrado'); // Error 404 

    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validateContact(req.body);
    //if (error) return res.status(400).send(error.details[0].message);
    if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

    //Update Contact
    contact.name = req.body.name;
    contact.description = req.body.description;
    contact.rejection = req.body.rejection;


    //Return the updated course
    res.send(contact);
});

//Funcion de Validación de Campos de Contactos
function validateContact(requiement) {

    const schema = {
        name: Joi.string().min(3).required()
    };

    return Joi.validate(requiement, schema);
}

/***********/
/* Lights */
/**********/

const userLights = [
    { id: 1, green: 100 },
    { id: 2, yellow: 50 },
    { id: 3, red: 5 }
];

const caseLights = [
    { id: 1, green: 100 },
    { id: 2, yellow: 50 },
    { id: 3, red: 5 }
];

//'BUSCAR Canal de Comunicaciones' GET Method
app.get('/api/admin/userlights', (req, res) => {
    res.send(userLights);
});

//'BUSCAR Canal de Comunicaciones' GET Method
app.get('/api/admin/caselights', (req, res) => {
    res.send(caseLights);
});


//'BUSCAR UN Semaforo' GET Method
app.get('/api/admin/userlights/:id', (req, res) => {
    //Look up the requierement
    //If not existing, return 404 - Not Found
    const userLight = userLights.find(l => l.id === parseInt(req.params.id));
    if (!userLight) return res.status(404).send('Semaforo no encontrado'); // Error 404 
    res.send(userLight);
});

//'BUSCAR UN Canal de Semaforo' GET Method
app.get('/api/admin/caselights/:id', (req, res) => {
    //Look up the requierement
    //If not existing, return 404 - Not Found
    const caserLight = caseLights.find(l => l.id === parseInt(req.params.id));
    if (!caseLight) return res.status(404).send('Semaforo no encontrado'); // Error 404 
    res.send(caseLight);
});

//'CREAR Semaforo' POST Method
app.post('/api/admin/userlights', (req, res) => {
    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validateLight(req.body);
    //if (error) return res.status(400).send(error.details[0].message);
    if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

    const userLight = {
        id: userLights.length + 1,
        green: req.body.green,
        yellow: req.body.yellow,
        red: req.body.red
    };
    userLights.push(userLight);
    res.send(userLight);
});

//'CREAR Semaforo' POST Method
app.post('/api/admin/caselights', (req, res) => {
    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validateLight(req.body);
    //if (error) return res.status(400).send(error.details[0].message);
    if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

    const caseLight = {
        id: caseLights.length + 1,
        green: req.body.green,
        yellow: req.body.yellow,
        red: req.body.red
    };
    caseLights.push(caseLight);
    res.send(caseLight);
});

//'MODIFICAR Semaforo' PUT Method
app.put('/api/admin/userlights/:id', (req, res) => {
    //Look up the requierement
    //If not existing, return 404 - Not Found
    const userLight = userLights.find(l => l.id === parseInt(req.params.id));
    if (!userLight) return res.status(404).send('Semaforo no encontrado'); // Error 404 

    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validateLight(req.body);
    //if (error) return res.status(400).send(error.details[0].message);
    if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

    //Update Contact
    caseLight.name = req.body.name;

    //Return the updated course
    res.send(caseLight);
});

//'MODIFICAR Semaforo' PUT Method
app.put('/api/admin/caselights/:id', (req, res) => {
    //Look up the requierement
    //If not existing, return 404 - Not Found
    const caseLight = caseLights.find(l => l.id === parseInt(req.params.id));
    if (!caseLight) return res.status(404).send('Semaforo no encontrado'); // Error 404 

    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validateLight(req.body);
    //if (error) return res.status(400).send(error.details[0].message);
    if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

    //Update Contact
    caseLight.name = req.body.name;

    //Return the updated course
    res.send(caseLight);
});

//Funcion de Validación de Campos de Contactos
function validateLight(requiement) {

    const schema = {
        green: Joi.number().required(),
        yellow: Joi.number().required(),
        red: Joi.number().required()
    };

    return Joi.validate(requiement, schema);
}

/**************************/
/* rejects */
/************************/

const rejects = [
    { id: 1, name: 'No procede' },
    { id: 2, name: 'Mal radicado' },
    { id: 3, name: 'Faltan info o soportes' }
];

//'BUSCAR Causal de Rechazo' GET Method
app.get('/api/admin/rejects', (req, res) => {
    res.send(rejects);
});


//'BUSCAR UN Causal de Rechazo ESPECIFICO' GET Method
app.get('/api/admin/rejects/:id', (req, res) => {
    //Look up the requierement
    //If not existing, return 404 - Not Found
    const reject = rejects.find(r => r.id === parseInt(req.params.id));
    if (!reject) return res.status(404).send('Causal de Rechazo no encontrada'); // Error 404 
    res.send(reject);
});

//'CREAR Causal de Rechazo' POST Method
app.post('/api/admin/rejects', (req, res) => {
    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validatereject(req.body);
    //if (error) return res.status(400).send(error.details[0].message);
    if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

    const reject = {
        id: rejects.length + 1,
        name: req.body.name
    };
    rejects.push(reject);
    res.send(reject);
});

//'MODIFICAR Causal de Rechazo' PUT Method
app.put('/api/admin/rejects/:id', (req, res) => {
    //Look up the requierement
    //If not existing, return 404 - Not Found
    const reject = rejects.find(r => r.id === parseInt(req.params.id));
    if (!reject) return res.status(404).send('rejecto no encontrado'); // Error 404 

    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validatereject(req.body);
    //if (error) return res.status(400).send(error.details[0].message);
    if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

    //Update reject
    reject.name = req.body.name;

    //Return the updated course
    res.send(reject);
});

//Funcion de Validación de Campos de rejects
function validatereject(requiement) {

    const schema = {
        name: Joi.string().min(3).required()
    };

    return Joi.validate(requiement, schema);
}
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));