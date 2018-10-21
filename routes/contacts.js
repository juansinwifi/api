const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const Joi = require('joi'); //Validacion de Inputs en el servicio


/*************/
/* CONTACTS */
/************/

const contacts = [
    { id: 1, name: 'Titular' },
    { id: 2, name: 'Paciente' },
    { id: 3, name: 'Clinica' }
];

//'BUSCAR Canal de Comunicaciones' GET Method
router.get('/', auth, (req, res) => {
    res.send(contacts);
});


//'BUSCAR UN Canal de Comunicaciones ESPECIFICO' GET Method
router.get('/:id', auth, (req, res) => {
    //Look up the requierement
    //If not existing, return 404 - Not Found
    const contact = contacts.find(c => c.id === parseInt(req.params.id));
    if (!contact) return res.status(404).send('Contacto no encontrado'); // Error 404 
    res.send(contact);
});

//'CREAR Contacto' POST Method
router.post('/', auth, (req, res) => {
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
router.put('/:id', auth, (req, res) => {
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

module.exports = router;