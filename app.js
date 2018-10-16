/* DENTIX WORKFLOW API */
/* Elaborardo: Juan Sebastian Otero - B612 Technologies S.A.S */
/* Versión 1: 08-09-2018 */
/* Versión 2: 13-10-2018 */
/* Node Version: 5.6.0   */

const startupDebugger = require('debug')('app:startup');
const dbDebuger = require('debug')('app:db');
const hemlet = require('helmet'); //Protege sobre vulnerabilidades de la cabeceras HTTP
const Joi = require('joi'); //Validacion de Inputs en el servicio
const cors = require('cors'); //Permite Conexiones desde cualquier origen
const mongoose = require('mongoose'); //Manejador de Node.js con MongoDB
//Install NPM lodash 
//Install NPM bcryptjs

const requirements = require('./routes/requirements');
const typifications = require('./routes/typifications');
const profiles = require('./routes/profiles');
const areas = require('./routes/areas');
const users = require('./routes/users');
const cases = require('./routes/cases');
const channels = require('./routes/channels');
const contacts = require('./routes/contacts');
const lights = require('./routes/lights');
const rejects = require('./routes/rejects');
const auth = require('./routes/auth')

const express = require('express');
const app = express();

mongoose.connect('mongodb://localhost/dentixDB', { useNewUrlParser: true })
    .then(() => dbDebuger('Connected to DentixDB...'))
    .catch(err => dbDebuger('Could not connect to DentixDB...', err));
mongoose.set('useCreateIndex', true);


app.use(express.json()); //Lee entradas en formato json
app.use(cors());
app.use(hemlet());
app.use('/api/admin/requirements', requirements); //Requerimientos
app.use('/', typifications); //Tipificaciones
app.use('/api/admin/profiles', profiles); //Perfiles
app.use('/api/admin/areas', areas); //Areas
app.use('/api/admin/users', users); //Usuarios
app.use('/api/admin/cases', cases); //Casos
app.use('/api/admin/channels', channels); //Canales de Comunicación
app.use('/api/admin/contacts', contacts); //Contactos
app.use('/api/admin/lights', lights); //Semaforos
app.use('/api/admin/rejects', rejects); //Causal de Rechazo
app.use('/api/auth', auth); //Autenticacion de Usuarios

const port = process.env.PORT || 3000;
app.listen(port, () => startupDebugger(`Listening on port ${port}...`));