
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const Person = require('./models/person-schema');

const app = express();

app.use(express.json());
// app.use(requestLogger);
app.use(morgan('tiny'));
app.use(express.static('dist'));

app.get('/api/persons', (request, response) => {

    Person.find({})
        .then(persons => {
            response.json(persons)
        })
        .catch(error => {
            console.error(error)
            response.status(500).json({ error: 'Database query failed' })
        })
});

app.get('/info', (request, response, next) => {
    Person.countDocuments({})
        .then(count => {
            const now = new Date()
            response.send(`
        <p>Phonebook has info for ${count} people</p>
        <p>${now}</p>
      `)
        })
        .catch(error => next(error))
});


app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).json({ error: 'person not found' })
            }
        })
        .catch(error => next(error))
});


app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            if (result) {
                response.status(204).end()
            } else {
                response.status(404).json({ error: 'person not found' })
            }
        })
        .catch(error => next(error))
})


app.post('/api/persons', (request, response, next) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({ error: 'name or number missing' })
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save()
        .then(savedPerson => {
            response.status(201).json(savedPerson)
        })
        .catch(error => next(error))
})

// PORT: render provides port #
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint);