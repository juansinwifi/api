const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const appUpload = require('debug')('app:upload');
const Joi = require('joi'); //Validacion de Inputs en el servicio
var cors = require('cors');
const csv = require('csvtojson');
const csvFilePath = './uploads/customers/database.csv';
const appCsv = require('debug')('app:csv');
const {Customer} = require('../models/customer');

/*****************************/
/* Carga de la Base de Datos */
/****************************/


//'MODIFICAR TIPIFICACIÓN' PUT Method
router.post('/',  async(req, res) => {
   
    //If invalid, return 404 - Bad Request
    appUpload(req.files);
   
    if (!req.files) {
        return res.status(400).send({'Error':'No hay archivo para subir.'});
    }
    
    //Validate Data
    //If invalid, return 404 - Bad Request
    // const { error } = validate(req.files);
    // if (error) return res.status(400).send(error.details[0].message);


    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
      let dataBase = req.files.file;
    
      // Use the mv() method to place the file somewhere on your server
      dataBase.mv('./uploads/customers/database.csv', function(err) {
        if (err) return res.status(500).send(err);
        if (!err) appUpload('Archivo Subido!');
      });
      res.send({'OK':'Archivo Subido!'});
});

//Cuanta los clientes a subir GET
router.get('/total',  async (req, res) => {

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
    appCsv(jsonArray.length)
    res.send( jsonArray.length + ' ');
});


//'Cuenta CLIENTE' POST Method
router.get('/count',  async (req, res) => {

    const count =  await Customer.countDocuments();
    if (!count) return res.status(404).send({'ERROR': 'No se encontrarón datos en la base de datos.'}); // Error 404
    res.send(count + '' );

});

//Funcion de Validación de Campos de Contactos
function validate(requiement) {

    const schema = {
        file: Joi.object().required()
    };

    return Joi.validate(requiement, schema);
}


module.exports = router;