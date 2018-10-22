const auth = require('../middleware/auth');
const {Customer, validate} = require('../models/customer');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Joi = require('joi'); //Validacion de Inputs en el servicio
const _ = require('lodash');

/***********/
/* CLIENTE */
/***********/

//'BUSCAR CLIENTES' GET Method
router.get('/', auth, async (req, res) => {
    try {
    const customers = await Customer.find().sort('name');
    res.send(customers);
    }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    }
});

//'BUSCAR UN CLIENTE ESPECIFICO' GET Method
router.get('/:id', auth, async (req, res) => {
    try{
        //Look up the Profiles
        //If not existing, return 404 - Not Found
        const customers = await Customer.findOne({"identification": req.params.id});
        if (!customers) return res.status(404).send('Cliente no encontrado'); // Error 404 
        res.send(customers);
    }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    }
});

//'CREAR CLIENTE' POST Method
router.post('/', auth, async (req, res) => {
    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let customer = new Customer(_.pick(
        req.body, [ 
            'identification',
            'name',
            'tc',
            'phone1',
            'phone2',
            'clinic',
            'date',
            'pastdueDate',
            'pastdueValue',
            'gag',
            'minPayment',
            'fee',
            'quota',
            'totalPayment',
            'affinity',
            'production'
    ])
    );
   
    customer = await customer.save();
    res.send(customer);
});
module.exports = router;