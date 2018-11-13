
const csv = require('csvtojson');
const mongoose = require('mongoose');
const {Customer, validate} = require('../models/customer');
const appCsv = require('debug')('app:csv');
const _ = require('lodash');
const express = require('express');
const router = express.Router();

const csvFilePath = './uploads/customers/database.csv';

//'CREAR CLIENTE' POST Method
router.post('/',  async (req, res) => {

    //Creamos un arreglo con los datos subidos
    const jsonArray = await csv({
            delimiter: '|',
            noheader: false,
            headers: [
                'id','name', 'affinity', 'ref', 'quote', 'clinic', 'production', 'limitDate', 
                'minPay', 'pastdueAge', 'pastdueDate', 'gag', 'totalPay', 'phone1', 'phone2', 'email'
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
                'minPay', 'pastdueAge', 'pastdueDate', 'gag', 'totalPay', 'phone1', 'phone2', 'email'
            ])
        );
        saveCustomer = await saveCustomer.save();
        i++;
    }

    res.send({'OK': jsonArray.length + ' clientes fueron guardados.'});
});

module.exports = router;
