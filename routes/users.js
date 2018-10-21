const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const {Users, validate} = require('../models/user');
const express = require('express');
const router = express.Router();
const Joi = require('joi'); //Validacion de Inputs en el servicio
const mongoose = require('mongoose');
const {Profiles} = require('../models/profiles');


/**********/
/* Users */
/*********/

//Buscar un Usuario con WebTokem
router.get('/me', auth, async (req, res) => {
    try{
        const user = await Users.findOne({_id : req.user._id}).select('-password');  
        const me = _.pick(user, ['_id','user', 'identification', 'name', 'email',  'phone', 'area', 'country']);  
        
        const roles = [];
        const operations = 'R';
        me.roles = roles;
        me.operations = operations;
   
        let i = 0;
        while (i < user.profiles.length){
            const userProfile = await Profiles.findOne({_id : user.profiles[i]});
            me.roles.push(userProfile);
            i++;
        }
        res.send(me);
    }
    catch(ex){
        console.log(ex);
    }
});

//'BUSCAR USUARIOS' GET Method
router.get('/', auth, async (req, res) => {
    const users = await Users.find().sort('name');
    res.send(users);
});


//'BUSCAR UN USUARIO ESPECIFICO' GET Method
router.get('/:id', auth, async (req, res) => {
    try{
    //Look up the requierement
    //If not existing, return 404 - Not Found
    const user = await Users.findById(req.params.id);
    if (!user) return res.status(404).send('Usuario no encontrado'); // Error 404 
    res.send(_.pick(user, ['active', 'user', 'password', 'identification', 'name', 'email',  'phone', 'profiles', 'area', 'country']));  
    }
    catch(ex){
        res.status(500).send('Algo salio mal :(');
    }
});

//'CREAR USUARIO' POST Method
router.post('/', auth, async (req, res) => {
    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validate(req.body);
    if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

    //El usuario debe ser unico
    let user = await Users.findOne({ user: req.body.user});
    if (user) return res.status(400).send('El Usuario ya esta registrado.');

    //El email debe ser unico 
    user = await Users.findOne({ email: req.body.email});
    if (user) return res.status(400).send('Ya existe un usuario registrado con ese email.');

    user = new Users(_.pick(req.body, ['active', 'user', 'password', 'identification', 'name', 'email',  'phone', 'profiles', 'area', 'country' ]));
        
    //Generamos el Password con bcryptjs
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);

    user = await user.save();
    //Return the updated Users
    res.send(_.pick(user, ['active', 'user', 'identification', 'name', 'email', 'phone', 'profiles', 'area', 'country']));

});

//'MODIFICAR USUARIO' PUT Method
router.put('/:id', auth, async (req, res) => {
    try{
        //Guardar los datos del usuario actual
        let currentUser = await Users.findById(req.params.id);

         //If invalid, return 404 - Bad Request
        const { error } = validate(req.body);
        if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

        //El usuario debe ser unico
        if (currentUser.user != req.body.user){
            let user = await Users.findOne({ user: req.body.user});
            if (user) return res.status(400).send('El Usuario ya esta registrado.');
        }
        //El email debe ser unico 
        if (currentUser.email != req.body.email){
        user = await Users.findOne({ email: req.body.email});
        if (user) return res.status(400).send('Ya existe un usuario registrado con ese email.');
        }

        //Generamos el Password con bcryptjs
        const salt = await bcrypt.genSalt(10);
        const newPassword = await bcrypt.hash(req.body.password, salt);

        user = await Users.findOneAndUpdate({_id: req.params.id},{
            active: req.body.active,
            user: req.body.user,
            password: newPassword,
            identification: req.body.identification,
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            profiles: req.body.profiles,
            area: req.body.area,
            country: req.body.country
        },{
            new: true
        });
    
        //If not existing, return 404 - Not Found
        if (!user) return res.status(404).send('Usuario no encontrado'); // Error 404  
    
        //Return the updated Users
        res.send(_.pick(user, ['active', 'user', 'identification', 'name', 'email', 'phone', 'profiles', 'area', 'country']));

        }
        catch(ex){
            res.status(500).send('Algo salio mal :( ' + ex);
        }

});



module.exports = router;