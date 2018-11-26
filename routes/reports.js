const auth = require('../middleware/auth');
const {Records} = require('../models/record');
const {validateReport} = require('../models/reports');
const {Flow} = require('../models/flow');
const {CustomersUpdates} = require('../models/customersUpdates');
const {Requirements} = require('../models/requirements');
const {diffDate} = require('../middleware/flow');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const moment = require('moment');
const fs = require('fs');
var randomstring = require("randomstring");
const Json2csvParser = require('json2csv').Parser;
const appReport = require('debug')('app:reports');
const appReportUser = require('debug')('app:reportsUser');
const { Typifications } = require('../models/typification');
const { ChildTypifications } = require('../models/childtypification');
const {Lights} = require('../models/lights');
const {Users} = require('../models/user');

/*************/
/* REPORTES */
/************/



//'Casos Abiertos
router.post('/records/opens/', async (req, res) => {
    try {
    appReport(req.body);
    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validateReport(req.body);
    if (error) return res.status(400).send({'ERROR':  error.details[0].message});

    const date =  moment(req.body.date).format('YYYY-MM-DD').toString()  ;
    appReport(date);
    
    const records = await Records.find({ "date": new RegExp(date) });
    if (!records || records.length == 0) return res.status(404).send({'ERROR':'No se encuentran Radicados para esta fecha.'}); // Error 404 
    appReport(records)
    
        
        
        }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    }
});

//'Casos Abiertos
router.get('/records/opens/:file', async (req, res) => {
    try { 
        const fileName =  './downloads/' + req.params.file;
            //Creamos un Stream para seguir el archivo y luego borrarlo
            let file = fs.createReadStream(fileName);
            res.download(fileName, 'radicados_abiertos.csv');
            //Cuando se termine de bajar lo borramos
            file.on('end', function() {
              fs.unlink(fileName, function() {
                // file deleted
                appReport('Deleted!');
              });
            });
            file.pipe(res);
     
        }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    }
});

//Casos Cerrados
//'Casos Abiertos
router.post('/records/closes', async (req, res) => {
    try {

    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validateReport(req.body);
    if (error) return res.status(400).send({'ERROR':  error.details[0].message});

    const date =  moment(req.body.date).format('YYYY-MM-DD') ;
    appReport(date);
    //const flow = await Flow.find({"user": req.params.id, "status": true});
    const findRecord = await Records.find({"status":true,  "date":  { $regex: date} });
    if (!findRecord) return res.send({'ERROR':'No se encuentran Radicados para esta fecha.'}); // Error 404 
 
    const response = [];
    let i = findRecord.length;
    let p = i - 1 ;
    while ( i > 0){
        
        let typification = await Typifications.findById(findRecord[p].typification);
        if (!typification || typification.length == 0) return res.status(404).send('No se encontro una tipificación.'); // Error 404 
        
        let child = await ChildTypifications.findById(findRecord[p].child);
        if (!child || child.length == 0) return res.status(404).send('No se encontro una tipificación especifica.'); // Error 404 
        
        const light = await Lights.findOne({"name": 'CASO'});
        if (!light) return res.status(404).send('Semaforo de casos no encontrado'); // Error 404 

        const lightUser = await Lights.findOne({"name": 'USUARIO'});
        if (!lightUser) return res.status(404).send('Semaforo de usuario no encontrado'); // Error 404 
       
        const record = { 
            _id: findRecord[0]._id,
            number: findRecord[0].number,
            userLight: flow[p].light,
            caseLight: findRecord[0].caseLight,
            typification: typification.name,
            child: child.name,
            date: findRecord[0].date,
            caseUserDate: findRecord[0].caseFinDate
        };

        response.push(record);
        i = i - 1;
        p = p - 1;
    }

 

        //Convertir respuesta a CSV

        
        const fields = [
                        { 
                            label: 'RADICADO',
                            value: 'number'
                        }, 
                        {
                            label: 'USUARIO',
                            value: 'user'
                        },
                        {

                            label: 'SEMAFORO USUARIO',
                            value: 'userLight'
                        },
                        {
                            label: 'SEMAFORO CASO',
                            value: 'caseLight'
                        },
                        {
                            label: 'TIPIFICACION',
                            value: 'typification'
                        },
                        {
                            label: 'TIPIFICACION ESPECIFICA',
                            value:  'child'
                        }, 
                        {
                            label: 'TIPO PQR',
                            value:  'pqr'
                        },
                        {
                            label: 'CREACION',
                            value: 'date'
                        },
                        {
                            label: 'VENCIMIENTO USUARIO',
                            value: 'userFinDate'
                        },
                        {
                            label: 'VENCIMIENTO CASO',
                            value: 'caseFinDate'
                        },{
                            label: 'FECHA DE SEGUIMIENTO',
                            value: 'trackingDate'
                            
                        }
                    ];
        const json2csvParser = new Json2csvParser({ fields });
        const csv = json2csvParser.parse(response);
        appReport(csv);
        const random = randomstring.generate(8);
        const fileName = './downloads/Open' + random +'.txt';
        fs.writeFile(fileName, csv, function (err) {
            if (err) throw err;
            appReport('Saved!');
            
            //Creamos un Stream para seguir el archivo y luego borrarlo
            let file = fs.createReadStream(fileName);
            res.download(fileName, 'radicados_abiertos.csv');
            //Cuando se termine de bajar lo borramos
            file.on('end', function() {
              fs.unlink(fileName, function() {
                // file deleted
                appReport('Deleted!');
              });
            });
            file.pipe(res);
        });
     
        }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    }
});

router.get('/customers/updates', async (req, res) => {
    try {

        const customersUpdates = await CustomersUpdates.find().sort('date');
        if (!customersUpdates) return res.status(404).send({'ERROR:':'No hay Actualizaciones'}); // Error 404 
        
        //Convertir respuesta a CSV

        const fields = [
                        { 
                            label: 'CLIENTE',
                            value: 'customer'
                        }, 
                        {
                            label: 'USUARIO',
                            value: 'user'
                        },
                        {
                            label: 'TELEFONO1',
                            value: 'phone1'
                        },
                        {
                            label: 'TELEFONO2',
                            value: 'phone2'
                        },
                        {
                            label: 'EMAIL',
                            value: 'email'
                        }
                    ];
        const json2csvParser = new Json2csvParser({ fields });
        const csv = json2csvParser.parse(customersUpdates);
        appReport(csv);
        const random = randomstring.generate(8);
        const fileName = './downloads/customerUpdates' + random +'.txt';
        fs.writeFile(fileName, csv, function (err) {
            if (err) throw err;
            appReport('Saved!');
            
            //Creamos un Stream para seguir el archivo y luego borrarlo
            let file = fs.createReadStream(fileName);
            res.download(fileName, 'actualizacion_datos.csv');
            //Cuando se termine de bajar lo borramos
            file.on('end', function() {
              fs.unlink(fileName, function() {
                // file deleted
                appReport('Deleted!');
              });
            });
            file.pipe(res);
        });
     
        }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    }
});

module.exports = router;