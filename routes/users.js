const express = require('express');
const router = express.Router();

/**********/
/* Users */
/*********/

const users = [
    { id: 1, active: true, user: 'pf@dentix.co', password: 'HFK99$$e3#', identification: 1019023277, name: 'Pedro Ficticio', email: 'pedrito.ficticio@gmail.com', phone: "123124", profile: [1, 2], area: 1, country: 'Colombia' },
    { id: 2, active: true, user: 'jf@dentix.co', password: 'HFK99$$e3#', identification: 1020023254, name: 'Juan Ficticio', email: 'juanito.ficticio@outlook.com', phone: "123124", profile: [2], area: 3, country: 'Colombia' },
    { id: 3, active: false, user: 'af@dentix.co', password: 'HFK99$$e3#', identification: 1018041188, name: 'Alejandra Ficticia', email: 'aleja.ficticia@gmail.com', phone: "123124", profile: [1, 2, 3], area: 2, country: 'Colombia' }
];

//'BUSCAR USUARIOS' GET Method
router.get('/', (req, res) => {
    res.send(users);
});

//Traer los perfiles del servicio Profiles
//Traer las areas del servicio Areas

//'BUSCAR UN USUARIP ESPECIFICO' GET Method
router.get('/:id', (req, res) => {
    //Look up the requierement
    //If not existing, return 404 - Not Found
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).send('Usuario no encontrado'); // Error 404 
    res.send(user);
});

//'CREAR USUARIO' POST Method
router.post('/', (req, res) => {
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
router.put('/:id', (req, res) => {
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

module.exports = router;