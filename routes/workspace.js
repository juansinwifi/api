const auth = require('../middleware/auth');
const {backFlow, nextFlow, changeFlow, closeFlow, assingFlow, diffDate} = require('../middleware/flow');
const {Records} = require('../models/record');
const {Flow, validateFlow} = require('../models/flow');
const { Typifications } = require('../models/typification');
const { ChildTypifications } = require('../models/childtypification');
const { Channels } = require('../models/channels');
const { Contacts } = require('../models/contacts');
const { Customer } = require('../models/customer');
const {CustomersUpdates} = require('../models/customersUpdates');
const {Lights} = require('../models/lights');
const {Users} = require('../models/user');
const {Areas} = require('../models/areas');
const appFlow = require('debug')('app:flow');
const appFlowUser = require('debug')('app:flowUser');
const appHistory = require('debug')('app:History');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Joi = require('joi'); //Validacion de Inputs en el servicio
const moment = require('moment');

/***********/
/* AREA DE PRUEBAS */
/***********/



//Actualizar Clientes
router.get('/',  async (req, res) => {

    try {
        const customer = await CustomersUpdates.find({ "customer": req.params.id});
        if (!customer.length) return res.send([]); // Devuelvo vacio
        
        let i = 0;
        const credits = [];
        while(records[i]){
                let credit = records[i].ref;
                let found = credits.find(element => element == credit);
                if (credit != found) credits.push(credit);
            i++;
        }

        res.send(credits);

    } catch (ex) {
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :(' });
    }
        res.send('Mama Mia!!!');
    
});


module.exports = router;