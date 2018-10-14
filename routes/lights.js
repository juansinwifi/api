const express = require('express');
const router = express.Router();

/***********/
/* Lights */
/**********/

const lights = [
    { id: 1, green: 100, yellow: 50, red: 5, name: "Usuarios" },
    { id: 2, green: 100, yellow: 50, red: 5, name: "Casos" }
];

//'BUSCAR Canal de Comunicaciones' GET Method
router.get('/', (req, res) => {
    res.send(lights);
});


//'BUSCAR UN Semaforo' GET Method
router.get('/:id', (req, res) => {
    //Look up the requierement
    //If not existing, return 404 - Not Found
    const light = lights.find(l => l.id === parseInt(req.params.id));
    if (!light) return res.status(404).send('Semaforo no encontrado'); // Error 404 
    res.send(light);
});


//'CREAR Semaforo' POST Method
router.post('/', (req, res) => {
    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validateLight(req.body);
    //if (error) return res.status(400).send(error.details[0].message);
    if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

    const light = {
        id: lights.length + 1,
        green: req.body.green,
        yellow: req.body.yellow,
        red: req.body.red,
        name: req.body.name
    };
    lights.push(light);
    res.send(light);
});


//'MODIFICAR Semaforo' PUT Method
router.put('/:id', (req, res) => {
    //Look up the requierement
    //If not existing, return 404 - Not Found
    const light = lights.find(l => l.id === parseInt(req.params.id));
    if (!light) return res.status(404).send('Semaforo no encontrado'); // Error 404 

    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validateLight(req.body);
    //if (error) return res.status(400).send(error.details[0].message);
    if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

    //Update Contact
    light.green = req.body.green;
    light.yellow = req.body.yellow;
    light.red = req.body.red;
    light.name = req.body.name;
    //Return the updated course
    res.send(light);
});


//Funcion de Validación de Campos de Contactos
function validateLight(requiement) {

    const schema = {
        green: Joi.number().required(),
        yellow: Joi.number().required(),
        red: Joi.number().required(),
        name: Joi.string().min(3).required()
    };

    return Joi.validate(requiement, schema);
}

module.exports = router;