const express = require('express');
const router = express.Router();


/*********** */
/* PERFILES */
/************/

const profiles = [
    { id: 1, type: 'CONSULTA', permissions: 'R', total: 10, requirements: true, profiles: true, areas: true, users: true, typifications: { enable: true, available: [1, 2] }, case: true, channel: true, contact: true, lights: true, rejection: true },
    { id: 2, type: 'RADICADOR', permissions: 'W', total: 9, requirements: true, profiles: true, areas: true, users: true, typifications: { enable: false, available: [] }, case: true, channel: true, contact: true, lights: true, rejection: true },
    { id: 3, type: 'EJECUTOR', permissions: 'W', total: 7, requirements: true, profiles: false, areas: false, users: true, typifications: { enable: false, available: [] }, case: true, channel: true, contact: true, lights: true, rejection: true }
];


//'BUSCAR PERFILES' GET Method
router.get('/', (req, res) => {
    res.send(profiles);
});

//'BUSCAR UN PERFIL ESPECIFICO' GET Method
router.get('/:id', (req, res) => {
    //Look up the requierement
    //If not existing, return 404 - Not Found
    const profile = profiles.find(p => p.id === parseInt(req.params.id));
    if (!profile) return res.status(404).send('Perfil no encontrado'); // Error 404 
    res.send(profile);
});

//'CREAR PERFILES' POST Method
router.post('/', (req, res) => {
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
router.put('/:id', (req, res) => {
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

module.exports = router;