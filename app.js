/* DENTIX WORKFLOW API */
/* Elaborardo: Juan Sebastian Otero - B612 Technologies S.A.S */
/* Versión 1: 08-09-2018 */
/* Versión 2: 13-10-2018 */
/* Node Version: 5.6.0   */

const config = require('config');
const startupDebugger = require('debug')('app:startup');
const dbDebuger = require('debug')('app:db');
const hemlet = require('helmet'); //Protege sobre vulnerabilidades de la cabeceras HTTP
const Joi = require('joi'); //Validacion de Inputs en el servicio
const cors = require('cors'); //Permite Conexiones desde cualquier origen
const mongoose = require('mongoose'); //Manejador de Node.js con MongoDB
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
//Install NPM lodash 
//Install NPM bcryptjs
//Install NPM jsonwebtoken
//Install NPM config
//Install NPM moment
//Install NPM csvtojson
//Intall NPM express-fileupload
//Instal npm  json2csv
//Inatal npm install randomstring

if (!config.get('jwtPrivateKey')){
    startupDebugger('FATAL ERROR: jwtPrivateKey  is not defined,');
    process.exit(1);   
}

const requirements = require('./routes/requirements');
const typifications = require('./routes/typifications');
const childtypifications = require('./routes/childtypifications');
const profiles = require('./routes/profiles');
const areas = require('./routes/areas');
const users = require('./routes/users');
const cases = require('./routes/cases');
const channels = require('./routes/channels');
const contacts = require('./routes/contacts');
const lights = require('./routes/lights');
const rejects = require('./routes/rejects');
const vartypes = require('./routes/vartypes');
const auth = require('./routes/auth');
const customers = require('./routes/customer');
const records = require('./routes/records');
const flow = require('./routes/flow');
const holidays = require('./routes/holidays');
const uploadDB = require('./routes/uploadDB');
const reports = require('./routes/reports');
const ws = require('./routes/workspace');

const express = require('express');
const app = express();

var whitelist = ['http://localhost:4200', 'http://dentixapp.b612.cloud', 'http://localhost' ]
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  optionsSuccessStatus: 200,
  credentials: true
}
//origin: 'http://localhost:4200',
// var corsOptions = {
//     origin: 'http://dentixapp.b612.cloud',
//     optionsSuccessStatus: 200,
//     credentials: true
// };



mongoose.connect('mongodb://dentix.b612.cloud/dentixDB', { useNewUrlParser: true })
    .then(() => dbDebuger('Connected to DentixDB...'))
    .catch(err => dbDebuger('Could not connect to DentixDB...', err));
mongoose.set('useCreateIndex', true);

app.use(express.json()); //Lee entradas en formato json
app.use(cors());
app.use(express.static('uploads/records')); //Acceso a una carpeta estatica
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(hemlet());
app.use(fileUpload()); //Permite subir archivos
app.use('/api/admin/requirements', requirements); //Requerimientos
app.use('/api/admin/typifications', typifications); //Tipificaciones
app.use('/api/admin/childtypifications', childtypifications); //Tipificaciones Especificas
app.use('/api/admin/profiles', profiles); //Perfiles
app.use('/api/admin/areas', areas); //Areas
app.use('/api/admin/users', users); //Usuarios
app.use('/api/admin/cases', cases); //Casos
app.use('/api/admin/channels', channels); //Canales de Comunicación
app.use('/api/admin/contacts', contacts); //Contactos
app.use('/api/admin/lights', lights); //Semaforos
app.use('/api/admin/rejects', rejects); //Causal de Rechazo
app.use('/api/admin/vartypes', vartypes); //Tipos de Variables
app.use('/api/admin/holidays', holidays); //Dias Festivos
app.use('/api/admin/upload/', uploadDB); //Sube la Base de Datos de Clientes
app.use('/api/admin/reports/', reports); //Sube la Base de Datos de Clientes
app.use('/api/auth', auth); //Autenticacion de Usuarios
app.use('/api/users/', users); //Autenticacion de Usuarios
app.use('/api/customers', customers); //Información de Clientes
app.use('/api/records', records); //Información de Radicados
app.use('/inbox/', flow); //Información de Flujos de trabajo
app.use('/ws/', ws); //Area de trabajo Dev

const port = process.env.PORT || 3000;
app.listen(port, () => startupDebugger(`Listening on port ${port}...`));