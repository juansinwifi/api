const auth = require('../middleware/auth');
const {Records} = require('../models/record');
const {validateReport} = require('../models/reports');
const {Flow} = require('../models/flow');
const {CustomersUpdates} = require('../models/customersUpdates');
const {Requirements} = require('../models/requirements');
const {Rejects} = require('../models/rejects');
const {diffDate} = require('../middleware/flow');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const moment = require('moment');
const fs = require('fs');
var randomstring = require("randomstring");
const Json2csvParser = require('json2csv').Parser;
//Intento 2 para convertir CSV to Json
//const createCsvWriter = require('csv-writer').createObjectCsvWriter; 
//Intento 3 para convertir CSV to Json
const jsonexport = require('jsonexport'); 
const appReport = require('debug')('app:reports');
const appReportUser = require('debug')('app:reportsUser');
const { Typifications } = require('../models/typification');
const { ChildTypifications } = require('../models/childtypification');
const {Lights} = require('../models/lights');
const {Users} = require('../models/user');

/*************/
/* REPORTES */
/************/



//Generar Reporte Casos Abiertos
router.post('/records/opens/', async (req, res) => {
    try {
    //Validate Data
    //If invalid, return 404 - Bad Request
    const { error } = validateReport(req.body);
    if (error) return res.status(400).send({'ERROR':  error.details[0].message});

    const response = [];

    //Generar fechas
    const dates = [];
    let ini =  moment(req.body.iniDate).format('YYYY-MM-DD');
    dates.push(ini);
    const fin = moment(req.body.finDate).format('YYYY-MM-DD');
    while(ini != fin){
        ini =  moment(ini).add(1, 'days').format('YYYY-MM-DD');
        dates.push(ini);
    }
    let tequila = 0;
    while(dates[tequila]){
        const records = await Records.find({ "date": new RegExp(dates[tequila]), "status": false });
        if (records){  

            let i = 0;
            while(records[i]){
                const flow = await Flow.find({"record": records[i]._id, "status": true});
                if(flow){
                    let typification = await Typifications.findById(records[i].typification);
                    if (!typification || typification.length == 0) return res.status(404).send('No se encontro una tipificación.'); // Error 404 
                    
                    let child = await ChildTypifications.findById(records[i].child);
                    if (!child || child.length == 0) return res.status(404).send('No se encontro una tipificación especifica.'); // Error 404 
                    
                    const requirement = await Requirements.findById(child.requirement);
                    if (!requirement) return res.status(404).send('Requerimiento no encontrado'); // Error 404 
                

                    const light = await Lights.findOne({"name": 'CASO'});
                    if (!light) return res.status(404).send('Semaforo de casos no encontrado'); // Error 404 

                    const lightUser = await Lights.findOne({"name": 'USUARIO'});
                    if (!lightUser) return res.status(404).send('Semaforo de usuario no encontrado'); // Error 404 
                
                    //Buscamos el Usuario
                    const user = flow[0].user;
                    appReport(user);
                    const findUser = await Users.findOne({"_id": user});
                    if (!user) return res.status(404).send('Un usuario no fue encontrado'); // Error 404 
                    const userName = findUser.name;
                    const caseFinDate = records[i].caseFinDate;
                    //Verificar el estado del semaforo del caso
                        const creation =  records[i].date;
                        const now = moment()
                        const then = records[i].caseFinDate;
                        let  caseLight = 50; //Por Defecto el semaforo es amarillo

                        const result = moment(now).isBefore(then);
                        
                    
                        if(result) {
                            appReport('Radicado aun con tiempo.');
                            appReport('/* Creado: ' + creation );
                            appReport('/* Finaliza: ' + then);
                            appReport('*/ Hoy: ' + now.format('YYYY-MM-DD HH:mm') );
                            const totalTime = await diffDate(creation, then);
                            const currentTime = await diffDate(now, then);
                            appReport('Diferencia Total'); 
                            appReport(totalTime);
                            appReport('Diferencia Actual');
                            appReport(currentTime);
                            
                            const totalHours = (totalTime.days * 24) + totalTime.hours + (totalTime.minutes/60);
                            const currentHours = (currentTime.days * 24) + currentTime.hours + (currentTime.minutes/60);

                            const percent = (currentHours/totalHours) * 100;
                            appReport('Porcentaje: ' + percent);
                            if (percent <= light.red) caseLight = 0;
                            if (percent >= light.green) caseLight = 100;
                            appReport('Semaforo: ' + caseLight);
                            //Falta Actualizar los tiempos en el radicado
                        }
                        if(!result) appReport('Radicado Vencido.')
                        if(!result) caseLight = 0;
                    
                    //Verificar el estado del semaforo del usuario
                        appReport('##' + flow[0] + '##');

                        const creationUser =  records[i].date;
                        const nowUser = moment()
                        const thenUser = flow[0].finDate;
                        let  userLight = 50; //Por Defecto el semaforo es amarillo

                        const resultUser = moment(nowUser).isBefore(thenUser);
                        if(result) {
                            appReportUser('Usuario aun con tiempo.');
                            appReportUser('/* Creado: ' + creationUser );
                            appReportUser('/* Finaliza: ' + thenUser);
                            appReportUser('*/ Hoy: ' + nowUser.format('YYYY-MM-DD HH:mm') );
                            const totalTimeUser = await diffDate(creationUser, thenUser);
                            const currentTimeUser = await diffDate(nowUser, thenUser);
                            appReportUser('Diferencia Total'); 
                            appReportUser(totalTimeUser);
                            appReportUser('Diferencia Actual');
                            appReportUser(currentTimeUser);
                            
                            const totalHoursUser = (totalTimeUser.days * 24) + totalTimeUser.hours + (totalTimeUser.minutes/60);
                            const currentHoursUser = (currentTimeUser.days * 24) + currentTimeUser.hours + (currentTimeUser.minutes/60);

                            const percentUser = (currentHoursUser/totalHoursUser) * 100;
                            appReportUser('Porcentaje: ' + percentUser);
                            if (percentUser <= lightUser.red) userLight = 0;
                            if (percentUser >= lightUser.green) userLight = 100;
                            appReportUser('Semaforo: ' + userLight);
                            //Falta Actualizar los tiempos en el radicado
                        }
                        if(!resultUser) appReportUser('Radicado Vencido.')
                        if(!resultUser) userLight = 0;

                        if(userLight == 0) userLight = 'Rojo';
                        if(userLight == 50) userLight = 'Amarillo';
                        if(userLight == 100) userLight = 'Verde';

                        if(caseLight == 0) caseLight = 'Rojo';
                        if(caseLight == 50) caseLight = 'Amarillo';
                        if(caseLight == 100) caseLight = 'Verde';

                    const record = { 
                        number: records[i].number,
                        user: userName,
                        userLight: userLight,
                        caseLight: caseLight,
                        typification: typification.name,
                        child: child.name,
                        pqr: requirement.type,
                        date: records[i].date,
                        userFinDate: thenUser,
                        caseFinDate: caseFinDate,
                        trackingDate: records[i].trackingDate
                    };

                    response.push(record);
                }
            
                i++;
            }
        }
    tequila++;
    }
    
    if(!response.length) return res.status(404).send({'ERROR':'No se encuentran Radicados para esta fecha.'}); // Error 404 
    
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
    const name = 'Open' + random +'.txt'
    const fileName = './downloads/' + name;
    fs.writeFile(fileName, csv, function (err) {
    if (err) res.status(500).send({ 'Error': 'No se pudo generar el archivo'});
        appReport('Saved!');
        res.send({ 'file': name});
    });
}
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    }
});

//'Casos Abiertos tomar el archivo y borrarlo
router.get('/records/opens/:file', async (req, res) => {
    try { 
        if (!req.params.file) res.status(500).send({ 'Error': 'No se pudo generar el archivo'});
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

//Generar Casos Cerrados
router.post('/records/closes', async (req, res) => {
    try {
        //Validate Data
        //If invalid, return 404 - Bad Request
        const { error } = validateReport(req.body);
        if (error) return res.status(400).send({'ERROR':  error.details[0].message});
    
        const response = [];
    
        //Generar fechas
        const dates = [];
        let ini =  moment(req.body.iniDate).format('YYYY-MM-DD');
        dates.push(ini);
        const fin = moment(req.body.finDate).format('YYYY-MM-DD');
        while(ini != fin){
            ini =  moment(ini).add(1, 'days').format('YYYY-MM-DD');
            dates.push(ini);
        }
        let tequila = 0;
        while(dates[tequila]){
            const records = await Records.find({ "date": new RegExp(dates[tequila]), "status": true });
            if (records){  
                let i = 0;
                while(records[i]){
                    const flow = await Flow.find({"record": records[i]._id, "status": false, "case":4});
                    if(flow){
                        //Usuario Radicador
                        let createdUser = await Users.findById(records[i].createdBy);
                        //Usuario Finalizador
                        let lastUser =  await Users.findById(flow[0].user);
                        //Semaforo Usuario
                        let userLight = flow[0].light;
                        //Semaforo Caso
                        let caseLight = records[i].caseLight;
                        //Buscar Tipificacion 
                        let typification = await Typifications.findById(records[i].typification);
                        //Buscar Tipificacion Especifica
                        let child = await ChildTypifications.findById(records[i].child);
                        //Buscar tipo PQR
                        let requirement = await Requirements.findById(child.requirement);
                        // Fecha de Vencimiento Usuario
                        let finUser = flow[0].finDate;
                        // Fecha de Cierre
                        let closeDate = flow[0].timestamp
                        //Tipo de Gestion
                        let nameCase = '';
                        if (flow[0].case == 1)   nameCase = 'Rechazar - Devolver';
                        if (flow[0].case == 2)   nameCase = 'Finalizar -Avanzar';
                        if (flow[0].case == 3)   nameCase = 'En Gestión';
                        if (flow[0].case == 4)   nameCase = 'Cerrar Caso';
                        if (flow[0].case == 5)   nameCase = 'Abierto';
                        if (flow[0].case == 6)   nameCase = 'Reasignar Caso';
                        //Causal de Rechazo
                        const reject = await Rejects.findOne({"_id": flow[0].reject});
                        let nameReject = '  '
                        if (reject) nameReject = reject.name

                        const record = { 
                            RADICADO: records[i].number,
                            CLIENTE: records[i].customer,
                            CREDITO: records[i].ref,
                            CREADO: records[i].date,
                            RADICADOR: createdUser.name,
                            FINALIZADOR: lastUser.name,
                            SEMAFORO_USUARIO: userLight,
                            SEMAFORO_CASO: caseLight,
                            TIPIFICACION: typification.name,
                            TIPIFICACION_ESPECIFICA: child.name,
                            PQR: requirement.type,
                            VENCIMIENTO_USUARIO: finUser,
                            VENCIMIENTO_CASO: records[i].caseFinDate,
                            FECHA_SEGUIMIENTO: records[i].trackingDate,
                            ULTIMO_INGREO_RADICADOR: "-",
                            FECHA_CIERRE: closeDate,
                            TIPO_GESTION: nameCase,
                            CAUSAL_RECHAZO: nameReject

                        };
                        response.push(record);
                    }
                
                    i++;
                }
            }
        tequila++;
        }
        
        if(!response.length) return res.status(404).send({'ERROR':'No se encuentran Radicados para esta fecha.'}); // Error 404 
        
        //var json = JSON.stringify(response);
        //fs.writeFile('./uploads/records/2019/04/myjsonfile.json', json, 'utf8');

        const random = randomstring.generate(8);
        const name = 'Close' + random
        const fileName = './downloads/' + name + '.csv';

        jsonexport(response,function(err, csv){
            if(err) return appReport(err);
           
            fs.writeFile(fileName, csv, function (err) {
                if (err) res.status(500).send({ 'Error': 'No se pudo generar el archivo'});
                    appReport('Saved!');
                    res.send({ 'file': name});
                });
        });
        
    }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    }
});

//'Casos Abiertos tomar el archivo y borrarlo
router.get('/records/closes/:file', async (req, res) => {
    try { 
        if (!req.params.file) res.status(500).send({ 'Error': 'No se pudo generar el archivo'});
        const fileName =  './downloads/' + req.params.file + '.csv';
            //Creamos un Stream para seguir el archivo y luego borrarlo
            let file = fs.createReadStream(fileName);
            res.download(fileName, 'radicados_cerrados.csv');
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


//Actualizacion de Datos
router.post('/customers/updates', async (req, res) => {
    try {
    
    const response = [];
    const dates = [];
    let ini =  moment(req.body.iniDate).format('YYYY-MM-DD');
    dates.push(ini);
    const fin = moment(req.body.finDate).format('YYYY-MM-DD');
    while(ini != fin){
        ini =  moment(ini).add(1, 'days').format('YYYY-MM-DD');
        dates.push(ini);
    }

    let tequila = 0;
    while(dates[tequila]){
        const customersUpdates = await CustomersUpdates.find({ "date": new RegExp(dates[tequila]) }).sort('date');
        let i = 0;

        if(customersUpdates.length) {
            while(customersUpdates[i]){
                const customer ={};
                customer.customer = customersUpdates[i].customer;
                customer.user = customersUpdates[i].user;
                customer.phone1 = customersUpdates[i].phone1;
                customer.phone2 = customersUpdates[i].phone2;
                customer.email = customersUpdates[i].email;
                customer.date = customersUpdates[i].date;
                response.push(customer);
            i++;
            }
           
        }
        
    tequila++;
    }
    if(!response.length) return res.status(404).send({'ERROR':'No se encuentran datos para esta fecha.'}); // Error 404 
        
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
                        },
                        {
                            label: 'FECHA',
                            value: 'date'
                        }
                    ];
        //const json2csvParser = new Json2csvParser({ fields });
        //const csv = json2csvParser.parse(response);
        const csv = jsonexport(response); 
        appReport(csv);
        const random = randomstring.generate(8);
        const name = 'customerUpdates' + random +'.txt';
        const fileName = './downloads/' + name;
     
       
        fs.writeFile(fileName, csv, function (err) {
            if (err) res.status(500).send({ 'Error': 'No se pudo generar el archivo'});
                appReport('Saved!');
                res.send({ 'file': name});
        });
     
        }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    }
});

//Actualizacion de Datos tomar el archivo y borrarlo
router.get('/customers/updates/:file', async (req, res) => {
    try { 
        appReport(req.params.file);
        if (!req.params.file) res.status(500).send({ 'Error': 'No se pudo generar el archivo'});
        const fileName =  './downloads/' + req.params.file;
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
        }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    }
});
module.exports = router;