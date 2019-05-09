const auth = require('../middleware/auth');
const {Customer, validate, validateInformation} = require('../models/customer');
const {CustomersUpdates} = require('../models/customersUpdates');
const { Records} = require('../models/record');
const {Users} = require('../models/user');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const appCsv = require('debug')('app:csv');
const Joi = require('joi'); //Validacion de Inputs en el servicio
const _ = require('lodash');
const csv = require('csvtojson');
const csvFilePath = './uploads/customers/database.csv';
const moment = require('moment');

/***********/
/* CLIENTE */
/***********/

//'BUSCAR CLIENTES' GET Method
router.get('/',  async (req, res) => {
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
router.get('/:id', async (req, res) => {
    try{
        //Look up the Profiles
        //If not existing, return 404 - Not Found
        const customers = await Customer.find({"id": req.params.id});
        if (!customers) return res.status(404).send('Cliente no encontrado'); // Error 404 
        res.send(customers);
    }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    }
});

//'BUSCAR UN CLIENTE ESPECIFICO' GET Method
router.get('/records/:id', async (req, res) => {
    try{
        //If not existing, return 404 - Not Found
        const records = await Records.find({"number": req.params.id});
        if (!records) return res.status(404).send({'Error':'No se encuentran el radicados.'}); // Error 404 
        console.log (records);
        const customer = records[0].customer;
        res.send(customer);
    }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    }
});

//'BUSCAR UN CREDITO especifico' GET Method
router.get('/ref/:id', async (req, res) => {
    try{
        //Look up the Profiles
        //If not existing, return 404 - Not Found
        const customers = await Customer.find({"ref": req.params.id});
        if (!customers) return res.status(404).send('# de Referencia no encontrado'); // Error 404 
        res.send(customers);
    }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    }
});

//'CREAR CLIENTE' POST Method
router.post('/',  async (req, res) => {

    //Creamos un arreglo con los datos subidos
    const jsonArray = await csv({
            delimiter: '|',
            noheader: false,
            headers: [
                'id','name', 'affinity', 'ref', 'quote', 'clinic', 'production', 'limitDate', 
                'minPay', 'pastdueAge', 'pastdueDate', 'gag', 'totalPay', 'phone1', 'phone2', 'email', 'mouthV', 'mouthP'
            ]
        })
        .fromFile(csvFilePath)
        .on('error',(err)=>{  
            appCsv(err);
            return res.status(404).send({'ERROR': 'No se pudo convertir el CSV.'}); 
        });

    const dropCustomers =  await Customer.collection.drop();
    if (!dropCustomers) return res.status(404).send({'ERROR': 'No se pudo borrar la base de datos.'}); // Error 404
    
    let i = 0;
    while(jsonArray[i]){

        let customer = jsonArray[i];
        //Validamos los datos enviados
        const { error } = validate(customer);
        if (error) return res.status(400).send({'ERROR': error.details[0].message});
        //Borramos la BD anterior
        
        //Guardamos los nuevos datos en la BD
        let saveCustomer = new Customer(_.pick(
            customer, [ 
                'id','name', 'affinity', 'ref', 'quote', 'clinic', 'production', 'limitDate', 
                'minPay', 'pastdueAge', 'pastdueDate', 'gag', 'totalPay', 'phone1', 'phone2', 'email', 'mouthV', 'mouthP'
            ])
        );
        saveCustomer = await saveCustomer.save();
        i++;
    }

    res.send({'OK': jsonArray.length + ' clientes fueron guardados.'});
});


//Actualizar Clientes
router.put('/:id',  async (req, res) => {

    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validateInformation(req.body);
    //if (error) return res.status(400).send(error.details[0].message);
    if (error) return res.status(400).send('ERROR: ' + error.details[0].message + '. PATH: ' + error.details[0].path);

   const date = moment().format('YYYY-MM-DD HH:mm');

   const currentUser = await Users.findOne({"_id": req.body.user});
   if (!currentUser) return res.status(404).send('Usuario no encontrado'); // Error 404 

   const customer = await Customer.updateMany({'id': req.params.id}, {
        phone1: req.body.phone1,
        phone2: req.body.phone2,
        email: req.body.email
    },{
        new: true
    });

     //If not existing, return 404 - Not Found
     if (!customer) return res.status(404).send('Cliente no encontrado'); // Error 404 

    let customerUpdate = new CustomersUpdates({
        customer: req.params.id,
        user: currentUser.name,
        phone1: req.body.phone1,
        phone2: req.body.phone2,
        email: req.body.email,
        date: date
    });
   
    customerUpdate = await customerUpdate.save();
   
    //Return the updated course
    res.send(customer);
    
});


module.exports = router;