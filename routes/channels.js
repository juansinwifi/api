const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const Joi = require('joi'); //Validacion de Inputs en el servicio

/*************************/
/* COMUNICATION CHANNEL */
/***********************/

const channels = [
    { id: 1, name: 'Presencial' },
    { id: 2, name: 'inbound' },
    { id: 3, name: 'outbound' }
];

//'BUSCAR Canal de Comunicaciones' GET Method
router.get('/', auth, (req, res) => {
    res.send(channels);
});


//'BUSCAR UN Canal de Comunicaciones ESPECIFICO' GET Method
router.get('/:id', auth, (req, res) => {
    //Look up the requierement
    //If not existing, return 404 - Not Found
    const channel = channels.find(c => c.id === parseInt(req.params.id));
    if (!channel) return res.status(404).send('Canal de Comunicaciones no encontrada'); // Error 404 
    res.send(channel);
});

//'CREAR Canal de Comunicaciones' POST Method
router.post('/', auth, (req, res) => {
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
router.put('/:id', auth, (req, res) => {
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


module.exports = router;