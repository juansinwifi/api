const express = require('express');
const router = express.Router();


/************/
/* rejects */
/***********/

const rejects = [
    { id: 1, name: 'No procede' },
    { id: 2, name: 'Mal radicado' },
    { id: 3, name: 'Faltan info o soportes' }
];

//'BUSCAR Causal de Rechazo' GET Method
router.get('/', (req, res) => {
    res.send(rejects);
});


//'BUSCAR UN Causal de Rechazo ESPECIFICO' GET Method
router.get('/:id', (req, res) => {
    //Look up the requierement
    //If not existing, return 404 - Not Found
    const reject = rejects.find(r => r.id === parseInt(req.params.id));
    if (!reject) return res.status(404).send('Causal de Rechazo no encontrada'); // Error 404 
    res.send(reject);
});

//'CREAR Causal de Rechazo' POST Method
router.post('/', (req, res) => {
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
router.put('/:id', (req, res) => {
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

module.exports = router;