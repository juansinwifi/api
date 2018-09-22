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
    { id: 1, name: 'ACUERDO DE PAGO', custom: 'La la la' },
    { id: 2, name: 'NOVEDADES MONETARIAS', custom: 'Do Re Mi Fa' }
];

//'BUSCAR TIPIFICACIONES' GET Method
app.get('/api/admin/typifications', (req, res) => {
    res.send(typifications);
});

//'BUSCAR UNA TIPIFICACION ESPECIFICA' GET Method
app.get('/api/admin/typifications/:id', (req, res) => {
    //Look up the requierement
    //If not existing, return 404 - Not Found
    const typification = typifications.find(t => t.id === parseInt(req.params.id));
    if (!typification) return res.status(404).send('Tipificación no encontrada'); // Error 404 
    res.send(typification);
});


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
            mon: { check: true, ini: "0700", fin: "1700" },
            tue: { check: true, ini: "0700", fin: "1700" },
            wed: { check: true, ini: "0700", fin: "1700" },
            thu: { check: true, ini: "07:00", fin: "1700" },
            fri: { check: true, ini: "0700", fin: "1700" },
            sat: { check: false, ini: "0000", fin: "0000" },
            sun: { check: false, ini: "0000", fin: "0000" },
        },
        leader: "Pedro Ficticio",
        email: "pficticio@dentix.com"
    },
    {
        id: 2,
        name: "CLINICA  CALLE 90",
        attention: {
            mon: { check: true, ini: "0700", fin: "1700" },
            tue: { check: true, ini: "0700", fin: "1700" },
            wed: { check: true, ini: "0700", fin: "1700" },
            thu: { check: true, ini: "07:00", fin: "1700" },
            fri: { check: true, ini: "0700", fin: "1700" },
            sat: { check: true, ini: "0800", fin: "1200" },
            sun: { check: false, ini: "0000", fin: "0000" },
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
app.post('/api/admin/areas/:id', (req, res) => {
    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validateArea(req.body);
    //if (error) return res.status(400).send(error.details[0].message);
    if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

    const area = {
        id: areas.length + 1,
        name: req.body.name,
        attention: {
            mon: { check: req.body.attention.mon.check, ini: req.body.attention.mon.ini, fin: req.body.attention.mon.fin },
            tue: { check: req.body.attention.tue.check, ini: req.body.attention.tue.ini, fin: req.body.attention.tue.fin },
            wed: { check: req.body.attention.wed.check, ini: req.body.attention.wed.ini, fin: req.body.attention.wed.fin },
            thu: { check: req.body.attention.thu.check, ini: req.body.attention.thu.ini, fin: req.body.attention.thu.fin },
            fri: { check: req.body.attention.fri.check, ini: req.body.attention.fri.ini, fin: req.body.attention.fri.fin },
            sat: { check: req.body.attention.sat.check, ini: req.body.attention.sat.ini, fin: req.body.attention.sat.fin },
            sun: { check: req.body.attention.sun.check, ini: req.body.attention.sun.ini, fin: req.body.attention.sun.fin }
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
    area.attention.mon.ini = req.body.attention.mon.ini;
    area.attention.mon.fin = req.body.attention.mon.fin;
    area.attention.tue.check = req.body.attention.tue.check;
    area.attention.tue.ini = req.body.attention.tue.ini;
    area.attention.tue.fin = req.body.attention.tue.fin;
    area.attention.wed.check = req.body.attention.wed.check;
    area.attention.wed.ini = req.body.attention.wed.ini;
    area.attention.wed.fin = req.body.attention.wed.fin;
    area.attention.thu.check = req.body.attention.thu.check;
    area.attention.thu.ini = req.body.attention.thu.ini;
    area.attention.thu.fin = req.body.attention.thu.fin;
    area.attention.fri.check = req.body.attention.fri.check;
    area.attention.fri.ini = req.body.attention.fri.ini;
    area.attention.fri.fin = req.body.attention.fri.fin;
    area.attention.sat.check = req.body.attention.sat.check;
    area.attention.sat.ini = req.body.attention.sat.ini;
    area.attention.sat.fin = req.body.attention.sat.fin;
    area.attention.sun.check = req.body.attention.sun.check;
    area.attention.sun.ini = req.body.attention.sun.ini;
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
                ini: Joi.string().isoDate().required(),
                fin: Joi.string().isoDate().required()
            }),
            tue: Joi.object().required().keys({
                check: Joi.boolean().required(),
                ini: Joi.string().isoDate().required(),
                fin: Joi.string().isoDate().required()
            }),
            wed: Joi.object().required().keys({
                check: Joi.boolean().required(),
                ini: Joi.string().isoDate().required(),
                fin: Joi.string().isoDate().required()
            }),
            thu: Joi.object().required().keys({
                check: Joi.boolean().required(),
                ini: Joi.string().isoDate().required(),
                fin: Joi.string().isoDate().required()
            }),
            fri: Joi.object().required().keys({
                check: Joi.boolean().required(),
                ini: Joi.string().isoDate().required(),
                fin: Joi.string().isoDate().required()
            }),
            sat: Joi.object().required().keys({
                check: Joi.boolean().required(),
                ini: Joi.string().isoDate().required(),
                fin: Joi.string().isoDate().required()
            }),
            sun: Joi.object().required().keys({
                check: Joi.boolean().required(),
                ini: Joi.string().isoDate().required(),
                fin: Joi.string().isoDate().required()
            })
        }),
        leader: Joi.string().min(3).required(),
        email: Joi.string().email().required()
    };

    return Joi.validate(requiement, schema);
}


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
