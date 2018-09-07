const Joi = require('joi'); //Validacion de Inputs en el servicio
const express = require('express');
const app = express();
app.use(express.json()); //Lee entradas en formato json


const customers = [
    { id: 1, name: 'Juan', surname: 'Otero' },
    { id: 2, name: 'Bobby', surname: 'Axelrod' },
    { id: 3, name: 'Jhon', surname: 'Snow' }
];

app.get('/', (req, res) => {
    res.send('hello world');
});

app.get('/api/dentix', (req, res) => {
    res.send(customers);
});

app.get('/api/dentix/:id', (req, res) => {
    const customer = customers.find(c => c.id === parseInt(req.params.id));
    if (!customer) res.status(404).send('Cliente no encontrado'); // Error 404 
    res.send(customer);
});

app.post('/api/dentix/', (req, res) => {

    const schema = {
        name: Joi.string().min(3).required(),
        surname: Joi.string().min(3).required()

    };

    const result = Joi.validate(req.body, schema);
    if (result.error) {
        res.status(400).send(result.error.details[0].message);
    }

    const customer = {
        id: customers.length + 1,
        name: req.body.name,
        surname: req.body.surname
    };
    customers.push(customer);
    res.send(customer);
});


//Enviar varios parametros
app.get('/api/dentix/:name/:surname', (req, res) => {
    res.send(req.params);
});


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));