const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const {Users, validate} = require('../models/user');
const {Profiles} = require('../models/profiles');
const express = require('express');
const router = express.Router();
const Joi = require('joi'); //Validacion de Inputs en el servicio
const mongoose = require('mongoose');



/**********/
/* Users */
/*********/

//Buscar un Usuario con WebTokem
router.get('/me', auth, async (req, res) => {
    try{
        const user = await Users.findOne({_id : req.user._id}).select('-password');  
        const me = _.pick(user, ['_id','user', 'identification', 'name', 'email',  'phone', 'area', 'country', 'profiles']);  
        const roles = [];
        const permissions = {
            "typifications": 0,
            "requirements": 0,
            "profiles": 0,
            "areas": 0,
            "users": 0,
            "case": 0,
            "channel": 0,
            "contact": 0,
            "lights": 0,
            "rejection": 0,
            "upload": 0,
            "reports":0
        };
        const operations = {
            "typifications": false,
            "requirements": false,
            "profiles": false,
            "areas": false,
            "users": false,
            "case": false,
            "channel": false,
            "contact": false,
            "lights": false,
            "rejection": false,
            "upload": false,
            "reports":false
        };
 
        const myTypifications =[];

        me.roles = roles;
        me.operations = operations;
        me.permissions = permissions;
        me.typifications = myTypifications;

       
        let i = 0;
        while (i < user.profiles.length){
           const userProfile = await Profiles.findOne({_id : user.profiles[i]});

           let j = 0;
           const availables = userProfile.typifications.available;
           console.log(availables);
           while (j < availables.length){ 
                //  me.typifications.push({"id": availables[j]}); 
                const available = me.typifications.find(c => c.id == availables[j]);
                if (!available) me.typifications.push({"id":availables[j]}); 
                j++;
           }

           const typifications = userProfile.typifications.enable; //Enable solo aplica para este caso
           if (typifications){  
               me.operations.typifications = true;
               if (userProfile.permissions == "W") me.permissions.typifications = 1
            }
            

           const requirements = userProfile.requirements;
           if (requirements){
            me.operations.requirements = true; 
            if (userProfile.permissions == "W") me.permissions.requirements = 1
           }  

           const profiles = userProfile.profiles;
           if (profiles){
            me.operations.profiles = true;
            if (userProfile.permissions == "W") me.permissions.profiles = 1
           }

           const areas = userProfile.areas;
           if (areas)  {
               me.operations.areas = true;
               if (userProfile.permissions == "W") me.permissions.areas = 1

            }

           const users = userProfile.users;
           if (users)  {
               me.operations.users = true;
               if (userProfile.permissions == "W") me.permissions.users = 1
            }

           const cases = userProfile.case;
           if (cases)  {
               me.operations.case = true;
               if (userProfile.permissions == "W") me.permissions.case = 1
            }

           const channel = userProfile.channel;
           if (channel)  {
               me.operations.channel = true;
               if (userProfile.permissions == "W") me.permissions.channel = 1
            }

           const contact = userProfile.contact;
           if (contact)  {
               me.operations.contact = true;
               if (userProfile.permissions == "W") me.permissions.contact = 1
            }

           const lights = userProfile.lights;
           if (lights) { 
               me.operations.lights = true;
               if (userProfile.permissions == "W") me.permissions.lights = 1
            }

           const rejection = userProfile.rejection;
           if (rejection)  {
               me.operations.rejection = true;
               if (userProfile.permissions == "W") me.permissions.rejection = 1
            }

            const upload = userProfile.upload;
            if (upload)  {
                me.operations.upload = true;
                if (userProfile.permissions == "W") me.permissions.upload = 1
             }

            const reports = userProfile.reports;
           if (reports)  {
               me.operations.reports = true;
               if (userProfile.permissions == "W") me.permissions.reports = 1
            }

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
        res.status(500).send({'Error':'Algo salio mal :('});
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
        if(req.body.password) {
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
        }
        else{
            user = await Users.findOneAndUpdate({_id: req.params.id},{
                active: req.body.active,
                user: req.body.user,
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
        }
        //If not existing, return 404 - Not Found
        if (!user) return res.status(404).send('Usuario no encontrado'); // Error 404  
    
        //Return the updated Users
        res.send(_.pick(user, ['active', 'user', 'identification', 'name', 'email', 'phone', 'profiles', 'area', 'country']));

        }
        catch(ex){
            console.log(ex);
            res.status(500).send('Algo salio mal :( ' + ex);
        }

});



module.exports = router;