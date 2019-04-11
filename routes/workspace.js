const auth = require('../middleware/auth');
const {backFlow, nextFlow, changeFlow, closeFlow, assingFlow, diffDate} = require('../middleware/flow');
const {Records} = require('../models/record');
const {Flow, validateFlow} = require('../models/flow');
const { Typifications } = require('../models/typification');
const { ChildTypifications } = require('../models/childtypification');
const { Channels } = require('../models/channels');
const { Contacts } = require('../models/contacts');
const { Customer } = require('../models/customer');
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
router.put('/',  async (req, res) => {

    const flow = await Flow.find({file: null});
    
    let i = 0;
    while(flow[i]){
        const fix = await Flow.findByIdAndUpdate(flow[i]._id, {
                file: " "
            },{
                new: true
            });
        i++;
    }
    

    // const fix = await Flow.findByIdAndUpdate(req.params.id, {
    //     date: req.body.date
    // },{
    //     new: true
    // });

    res.send('Mama Miaa!!');
    
});


module.exports = router;