const auth = require('../middleware/auth');
const {Records} = require('../models/record');
const {Opens, Reports, validateReport} = require('../models/reports');
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
const es = require('event-stream');
var randomstring = require("randomstring");
const Json2csvParser = require('json2csv').Parser;
const json2csv = require('json2csv');
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

    const dropOpens =  await Opens.collection.drop();
    if (!dropOpens) return res.status(404).send({'ERROR': 'No se pudo borrar la base de datos.'}); // Error 404
    
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
        if(!records) return res.status(404).send({'ERROR':'No se encuentran Radicados para esta fecha.'}); // Error 404 
    
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
                            // appReport('Radicado aun con tiempo.');
                            // appReport('/* Creado: ' + creation );
                            // appReport('/* Finaliza: ' + then);
                            // appReport('*/ Hoy: ' + now.format('YYYY-MM-DD HH:mm') );
                            const totalTime = await diffDate(creation, then);
                            const currentTime = await diffDate(now, then);
                            // appReport('Diferencia Total'); 
                            // appReport(totalTime);
                            // appReport('Diferencia Actual');
                            // appReport(currentTime);
                            
                            const totalHours = (totalTime.days * 24) + totalTime.hours + (totalTime.minutes/60);
                            const currentHours = (currentTime.days * 24) + currentTime.hours + (currentTime.minutes/60);

                            const percent = (currentHours/totalHours) * 100;
                            // appReport('Porcentaje: ' + percent);
                            if (percent <= light.red) caseLight = 0;
                            if (percent >= light.green) caseLight = 100;
                            // appReport('Semaforo: ' + caseLight);
                            //Falta Actualizar los tiempos en el radicado
                        }
                        // if(!result) appReport('Radicado Vencido.')
                        if(!result) caseLight = 0;
                    
                    //Verificar el estado del semaforo del usuario
                        // appReport('##' + flow[0] + '##');

                        const creationUser =  records[i].date;
                        const nowUser = moment()
                        const thenUser = flow[0].finDate;
                        let  userLight = 50; //Por Defecto el semaforo es amarillo

                        const resultUser = moment(nowUser).isBefore(thenUser);
                        if(result) {
                            // appReportUser('Usuario aun con tiempo.');
                            // appReportUser('/* Creado: ' + creationUser );
                            // appReportUser('/* Finaliza: ' + thenUser);
                            // appReportUser('*/ Hoy: ' + nowUser.format('YYYY-MM-DD HH:mm') );
                            const totalTimeUser = await diffDate(creationUser, thenUser);
                            const currentTimeUser = await diffDate(nowUser, thenUser);
                            // appReportUser('Diferencia Total'); 
                            // appReportUser(totalTimeUser);
                            // appReportUser('Diferencia Actual');
                            // appReportUser(currentTimeUser);
                            
                            const totalHoursUser = (totalTimeUser.days * 24) + totalTimeUser.hours + (totalTimeUser.minutes/60);
                            const currentHoursUser = (currentTimeUser.days * 24) + currentTimeUser.hours + (currentTimeUser.minutes/60);

                            const percentUser = (currentHoursUser/totalHoursUser) * 100;
                            // appReportUser('Porcentaje: ' + percentUser);
                            if (percentUser <= lightUser.red) userLight = 0;
                            if (percentUser >= lightUser.green) userLight = 100;
                            // appReportUser('Semaforo: ' + userLight);
                            //Falta Actualizar los tiempos en el radicado
                        }
                        // if(!resultUser) appReportUser('Radicado Vencido.')
                        if(!resultUser) userLight = 0;

                        if(userLight == 0) userLight = 'Rojo';
                        if(userLight == 50) userLight = 'Amarillo';
                        if(userLight == 100) userLight = 'Verde';

                        if(caseLight == 0) caseLight = 'Rojo';
                        if(caseLight == 50) caseLight = 'Amarillo';
                        if(caseLight == 100) caseLight = 'Verde';

                        //Usuario Radicador
                        let createdUser = await Users.findById(records[i].createdBy);
                        //Usuario Finalizador
                        let lastUser =  await Users.findById(flow[0].user);
                        //Causal de Rechazo
                        const reject = await Rejects.findOne({"_id": flow[0].reject});
                        let nameReject = '  '
                        if (reject) nameReject = reject.name
                        //Ultimo ingreso del radicado
                        const lastEdit = await Flow.findOne({"record": records[i]._id, "level": -1});

                        //Tipo de Gestion
                        let nameCase = '';
                        if (flow[0].case == 1)   nameCase = 'Rechazar - Devolver';
                        if (flow[0].case == 2)   nameCase = 'Finalizar -Avanzar';
                        if (flow[0].case == 3)   nameCase = 'En Gestión';
                        if (flow[0].case == 4)   nameCase = 'Cerrar Caso';
                        if (flow[0].case == 5)   nameCase = 'Abierto';
                        if (flow[0].case == 6)   nameCase = 'Reasignar Caso';

                        //Observaciones 
                        let lastLevel = flow[0].level - 1;
                        if (flow[0].level == -1) lastLevel = -1;
                        let lastObservation = await Flow.findOne({"record": records[i]._id, "level": lastLevel});
                    
                        let finalForms = [];

                        if(records[i].forms){
                            let myForms = records[i].forms;
                            let t = 0;
                            
                            let content = "";
                            while(myForms[t]){
                              content =  myForms[t].value + ":" +myForms[t].description;
                              
                              finalForms.push(content);
                            t++;
                            }

                        }
                      
                        let opens = new Opens({ 
                            RADICADO: records[i].number,
                            CLIENTE:  records[i].customer,
                            CREDITO: records[i].ref,
                            CREADO: records[i].date,
                            RADICADOR: createdUser.name,
                            FINALIZADOR: lastUser.name,
                            SEMAFORO_USUARIO: userLight,
                            SEMAFORO_CASO: caseLight,
                            TIPIFICACION: typification.name,
                            TIPIFICACION_ESPECIFICA: child.name,
                            PQR: requirement.type,
                            VENCIMIENTO_USUARIO: flow[0].finDate,
                            VENCIMIENTO_CASO: records[i].caseFinDate,
                            FECHA_SEGUIMIENTO: records[i].trackingDate,
                            ULTIMO_INGREO_RADICADOR: lastEdit.timestamp,
                            TIPO_GESTION: nameCase,
                            CAUSAL_RECHAZO: nameReject,
                            OBSERVACIONES: lastObservation.observations,
                            FORMULARIOS: finalForms
                        });

                    opens = await opens.save();
                }
            
                i++;
            }
        }
    tequila++;
    }
    
    appReport("Termino el ciclo");

        const openReport = await Opens.find();
        if (!openReport) return res.status(404).send('Reporte no encontrado'); // Error 404 
        
         //Convertir respuesta a CSV 
        const fields = [
            {
                label: 'RADICADO',
                value: 'RADICADO'
            },
            {
                label: 'CLIENTE',
                value: 'CLIENTE'
            },
            {
                label: 'CREDITO', 
                value: 'CREDITO'
            },
            {
                label: 'CREADO',
                value: 'CREADO',
            },
            {
                label: 'RADICADOR',
                value: 'RADICADOR'
            },
            {
                label: 'FINALIZADOR',
                value: 'FINALIZADOR'
            },
            {
                label: 'SEMAFORO_USUARIO',
                value: 'SEMAFORO_USUARIO'
            },
            {	
                label: 'SEMAFORO_CASO',
                value: 'SEMAFORO_CASO'
                
            },
            {
                label: 'TIPIFICACION',
                value: 'TIPIFICACION'
            },
            {
                label: 'TIPIFICACION_ESPECIFICA',
                value: 'TIPIFICACION_ESPECIFICA'
                
            },
            {
                label: 'PQR',
                value: 'PQR'
            },
            {
                label: 'VENCIMIENTO_USUARIO',
                value: 'VENCIMIENTO_USUARIO'
            },
            {
                label: 'VENCIMIENTO_CASO',
                value: 'VENCIMIENTO_CASO'
            },
            {
                label: 'FECHA_SEGUIMIENTO',
                value: 'FECHA_SEGUIMIENTO'
            },
            {
                label: 'ULTIMO_INGREO_RADICADOR',
                value: 'ULTIMO_INGREO_RADICADOR',
            },
            {
                label: 'FECHA_CIERRE',
                value: 'FECHA_CIERRE',
            },
            {
                label: 'TIPO_GESTION',
                value: 'TIPO_GESTION',
            },
            {
                label: 'CAUSAL_RECHAZO',
                value: 'CAUSAL_RECHAZO'
            },
            {
                label: 'OBSERVACIONES',
                value: 'OBSERVACIONES'
            },
            {
                label: 'FORMULARIOS',
                value: 'FORMULARIOS'
            }
    ];

        const json2csvParser = new Json2csvParser({fields});
        const csv = json2csvParser.parse(openReport);
        //appReport(csv);
        const random = randomstring.generate(8);
        const name = 'Open' + random +'.csv'
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
        
            const dropCustomers =  await Reports.collection.drop();
            if (!dropCustomers) return res.status(404).send({'ERROR': 'No se pudo borrar la base de datos.'}); // Error 404
        
        //Validate Data
        //If invalid, return 404 - Bad Request
        const { error } = validateReport(req.body);
        if (error) return res.status(400).send({'ERROR':  error.details[0].message});
        
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
            if(!records) return res.status(404).send({'ERROR':'No se encuentran Radicados para esta fecha.'}); // Error 404 
        
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
                        let closeDate = flow[0].timestamp;
                        //observations
                       
                        let observations = " ";
                        if(flow[0].observations) observations = flow[0].observations;

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
                        let nameReject = '  ';
                        if (reject) nameReject = reject.name
                        //Ultimo ingreso del radicado
                        const lastEdit = await Flow.findOne({"record": records[i]._id, "level": -1});

                        let finalForms = [];
                        if(records[i].forms){
                            
                            let myForms = records[i].forms;
                            
                            let t = 0;
                            
                            let content = " ";
                            while(myForms[t]){
                              content =  myForms[t].value + ":" +myForms[t].description;
                              
                              finalForms.push(content);
                             
                            t++;
                            }

                        }

                        let reports = new Reports({
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
                            ULTIMO_INGREO_RADICADOR: lastEdit.timestamp,
                            FECHA_CIERRE: closeDate,
                            TIPO_GESTION: nameCase,
                            CAUSAL_RECHAZO: nameReject,
                            OBSERVACIONES: observations,
                            FORMULARIOS: finalForms
                        });
                        reports = await reports.save();  
                    }
                
                    i++;
                }
            }
        tequila++;
        }
        appReport("Termino el ciclo");
         //Convertir respuesta a CSV 
         const fields = [
            {
                label: 'RADICADO',
                value: 'RADICADO'
            },
            {
                label: 'CLIENTE',
                value: 'CLIENTE'
            },
            {
                label: 'CREDITO', 
                value: 'CREDITO'
            },
            {
                label: 'CREADO',
                value: 'CREADO',
            },
            {
                label: 'RADICADOR',
                value: 'RADICADOR'
            },
            {
                label: 'FINALIZADOR',
                value: 'FINALIZADOR'
            },
            {
                label: 'SEMAFORO_USUARIO',
                value: 'SEMAFORO_USUARIO'
            },
            {	
                label: 'SEMAFORO_CASO',
                value: 'SEMAFORO_CASO'
                
            },
            {
                label: 'TIPIFICACION',
                value: 'TIPIFICACION'
            },
            {
                label: 'TIPIFICACION_ESPECIFICA',
                value: 'TIPIFICACION_ESPECIFICA'
                
            },
            {
                label: 'PQR',
                value: 'PQR'
            },
            {
                label: 'VENCIMIENTO_USUARIO',
                value: 'VENCIMIENTO_USUARIO'
            },
            {
                label: 'VENCIMIENTO_CASO',
                value: 'VENCIMIENTO_CASO'
            },
            {
                label: 'FECHA_SEGUIMIENTO',
                value: 'FECHA_SEGUIMIENTO'
            },
            {
                label: 'ULTIMO_INGREO_RADICADOR',
                value: 'ULTIMO_INGREO_RADICADOR',
            },
            {
                label: 'FECHA_CIERRE',
                value: 'FECHA_CIERRE',
            },
            {
                label: 'TIPO_GESTION',
                value: 'TIPO_GESTION',
            },
            {
                label: 'CAUSAL_RECHAZO',
                value: 'CAUSAL_RECHAZO'
            },
            {
                label: 'OBSERVACIONES',
                value: 'OBSERVACIONES'
            },
            {
                label: 'FORMULARIOS',
                value: 'FORMULARIOS'
            }
    ];

    // res.send({ 'file': name});
        
        /*
        BEFORE
        */

       const closeReport = await Reports.find();
       if (!closeReport) return res.status(404).send('Reporte no encontrado'); // Error 404 
       
        const json2csvParser = new Json2csvParser({fields});
        const csv = json2csvParser.parse(closeReport);
        //appReport(csv);
        const random = randomstring.generate(8);
        const name = 'Closesx' + random +'.csv'
        const fileName = './downloads/' + name;
        
        fs.writeFile(fileName, csv, function (err) {
        if (err) res.status(500).send({ 'Error': 'No se pudo generar el archivo'});
            appReport('Saved!');
            res.send({ 'file': name});
        });
    } 
    catch(err){
        console.log(err);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    }
});

//'Casos Abiertos tomar el archivo y borrarlo
router.get('/records/closes/:file', async (req, res) => {
    try { 
        
        if (!req.params.file) res.status(500).send({ 'Error': 'No se pudo generar el archivo'});
        const fileName =  './downloads/' + req.params.file;
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
        // const json2csvParser = new Json2csvParser({ fields });
        // const csv = json2csvParser.parse(response);
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


/* CASOS ABIERTOS*/

//Ultimos 3 dias 
router.get('/records/opensday', async (req, res) => {
    try {

        const fileName =  './downloads/opens3days.csv';
        //Creamos un Stream para seguir el archivo y luego borrarlo
        let file = fs.createReadStream(fileName);
        file.on('error', function(error){
            res.status(500).send({ 'Error': 'Archivo no encontrado'});
          });
        res.download(fileName, 'ultimos_3_dias.csv');
        file.pipe(res);
       
    }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    }
});

//Ultima Semana 
router.get('/records/opensweek/', async (req, res) => {
    try {

        const fileName =  './downloads/opensweek.csv';
        //Creamos un Stream para seguir el archivo y luego borrarlo
        let file = fs.createReadStream(fileName);
        file.on('error', function(error){
            res.status(500).send({ 'Error': 'Archivo no encontrado'});
          });
        res.download(fileName, 'ultima_semana.csv');
        file.pipe(res);
       
    }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    }
});

//Ultima Mes 
router.get('/records/opensmonth/', async (req, res) => {
    try {

        const fileName =  './downloads/opensmonth.csv';
        //Creamos un Stream para seguir el archivo y luego borrarlo
        let file = fs.createReadStream(fileName);
        file.on('error', function(error){
            res.status(500).send({ 'Error': 'Archivo no encontrado'});
          });
        res.download(fileName, 'ultimo_mes.csv');
        file.pipe(res);
       
    }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    }
});

/* CASOS CERRADOS */

router.get('/records/closesday/', async (req, res) => {
    try {

        const fileName =  './downloads/close3days.csv';
        //Creamos un Stream para seguir el archivo y luego borrarlo
        let file = fs.createReadStream(fileName);
        file.on('error', function(error){
            res.status(500).send({ 'Error': 'Archivo no encontrado'});
          });
        res.download(fileName, 'cerrados_ultimos_3_dias.csv');
        file.pipe(res);
       
    }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    }
});

//Ultima Semana 
router.get('/records/closesweek/', async (req, res) => {
    try {

        const fileName =  './downloads/closeweek.csv';
        //Creamos un Stream para seguir el archivo y luego borrarlo
        let file = fs.createReadStream(fileName);
        file.on('error', function(error){
            res.status(500).send({ 'Error': 'Archivo no encontrado'});
          });
        res.download(fileName, 'cerrados_ultima_semana.csv');
        file.pipe(res);
       
    }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    }
});

//Ultima Mes 
router.get('/records/closesmonth/', async (req, res) => {
    try {

        const fileName =  './downloads/closemonth.csv';
        //Creamos un Stream para seguir el archivo y luego borrarlo
        // let file = fs.createReadStream(fileName);
        // file.on('error', function(error){
        //     res.status(500).send({ 'Error': 'Archivo no encontrado'});
        //   });
        // res.download(fileName, 'cerrados_ultimo_mes.csv');
        // file.pipe(res);
        
        res.download(fileName);
       
    }
    catch(ex){
        console.log(ex);
        res.status(500).send({ 'Error': 'Algo salio mal :('});
    }
});

module.exports = router;