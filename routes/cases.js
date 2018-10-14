const express = require('express');
const router = express.Router();

/**********/
/* CASES */
/*********/

const cases = [
    { id: 1, name: 'RECHAZAR- DEVOLVER', description: 'Se devuelve el caso al usuario anterior', rejection: true },
    { id: 2, name: 'FINALIZAR - AVANZAR', description: 'Avanzar al siguiente nivel, si es el último, se caso se marca como finalizado', rejection: false },
    { id: 3, name: 'EN GESTION', description: 'Cuando este pedte rsta para gestionar Incluir fecha de seguimiento', rejection: false }
];

//'BUSCAR CASOS' GET Method
router.get('/', (req, res) => {
    res.send(cases);
});

//Traer los perfiles del servicio Profiles
//Traer las areas del servicio Areas

//'BUSCAR UN CASO ESPECIFICO' GET Method
router.get('/:id', (req, res) => {
    //Look up the requierement
    //If not existing, return 404 - Not Found
    const myCase = cases.find(c => c.id === parseInt(req.params.id));
    if (!myCase) return res.status(404).send('Gestión no encontrada'); // Error 404 
    res.send(myCase);
});

//'CREAR CASOS' POST Method
router.post('/', (req, res) => {
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
router.put('/:id', (req, res) => {
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

module.exports = router;