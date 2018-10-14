/* DENTIX API */
/* Elaborardo: Juan Sebastian Otero - B612 Technologies S.A.S */
/* Versión 1: 08-09-2018 */
/* Versión 2: 13-10-2018 */


const hemlet = require('helmet'); //Protege sobre vulnerabilidades de la cabeceras HTTP
const Joi = require('joi'); //Validacion de Inputs en el servicio
const cors = require('cors'); //Permite Conexiones desde cualquier origen
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
const express = require('express');
const app = express();

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

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));