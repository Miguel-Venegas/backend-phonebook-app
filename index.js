// const requestLogger = (request, response, next) => {
//     console.log('Method:', request.method)
//     console.log('Path:  ', request.path)
//     console.log('Body:  ', request.body)
//     console.log('---')
//     next()
// }

const express = require('express');
const morgan = require('morgan');


const app = express();

app.use(express.json());
// app.use(requestLogger);
app.use(morgan('tiny'));
app.use(express.static('dist'));

const ID_SIZE = 1000000;
const ALPHABET_SIZE = 26;
let persons = [
    {
        "id": "1",
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": "2",
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": "3",
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": "4",
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
  response.json(persons);
})



app.get('/info', (request, response) => {
    const entries = persons.length;
    const now = new Date();
    const timeStamp = now.toString();

    const entriesMessage = `Phonebook has info for ${entries} people`;
    const timeStampMessage = `\n${timeStamp}`;

    const responseMessage = `${entriesMessage}${timeStampMessage}`;

    response.send(responseMessage);

});

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    const person = persons.find(person => person.id === id);
    if (!person) {
        response.status(404).end();
    } else {
        response.send(person);
    }
});


// delete

// Implement functionality that makes it possible to delete a single phonebook entry by making an HTTP DELETE request to the unique URL of that phonebook entry.

// Test that your functionality works with either Postman or the Visual Studio Code REST client.

app.delete('/api/persons/:id', (request, response) => {
    const id = String(request.params.id);
    const person = persons.find(person => person.id === id);
    if (person) {
        response.send(`<p>deleted: ${JSON.stringify(person)}</p>`)
        persons = persons.filter(person => person.id !== id);
        
    } else {
        response.status(404).end();
    }
});

// post

const generateRandomNumber = (num) => {
    return Math.floor(Math.random() * num);
};

const generateId = () => {
    const number = generateRandomNumber(ID_SIZE);
    const letter = [...`abcdefghijklmnopqrstuvwxyz`][generateRandomNumber(ALPHABET_SIZE)];
    const id = `${number}${letter}`;

    return id;
};




app.post('/api/persons', (request, response) => {

    console.log('Incoming POST:', request.headers['content-type']);
    console.log('Request body:', request.body);

    const { name, number } = request.body || {};

    if (!name || !number) {
        return response.status(400).send(`<p>Error: Missing name or number</p>`).end();
    } 
    
    const nameExists = persons.find(person => person.name.toLowerCase() === name.toLowerCase());

    const numberExists = persons.find(person => person.number === number);

    if (nameExists) {
        console.log(nameExists);
        return response.status(409).json({ error: 'name must be unique' });
    }

    if (numberExists) {
        console.log(numberExists);
        return response.status(409).json({ error: 'number must be unique' });
    }
    
    const person = {
        id: generateId(),
        name: name,
        number: number
    };

    persons = persons.concat(person);

    response.status(201).send(`<p>added: ${JSON.stringify(person)}</p>`);
    
});

// PORT: render provides port #
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint);