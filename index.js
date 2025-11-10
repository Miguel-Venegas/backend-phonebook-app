
require('dotenv').config()
const express = require('express')
const requestLogger = require('./middleware/logger')
const morgan = require('morgan')
const Person = require('./models/person-schema')

const app = express()

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}


// app.use(requestLogger);
app.use(morgan('tiny'))
app.use(express.static('dist'))
app.use(express.json())
app.use(requestLogger)

app.get('/api/persons', (request, response) => {

  Person.find({})
    .then(persons => {
      response.json(persons)
    })
    .catch(error => {
      console.error(error)
      response.status(500).json({ error: 'Database query failed' })
    })
})

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
})


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
})


app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      console.log(result)
      response.status(204).end()
    })
    .catch(error => next(error))
})


app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'name or number missing' })
  }

  const person = new Person({
    name: formatName(body.name),
    number: body.number
  })

  person.save()
    .then(savedPerson => {
      response.status(201).json(savedPerson)
    })
    .catch(error => next(error))
})


app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findById(request.params.id)
    .then(person => {
      if (!person) {
        return response.status(404).end()
      }

      person.name = formatName(name) || formatName(person.name)
      person.number = number || person.number

      return person.save().then((updatedPerson) => {
        response.json(updatedPerson)
      })
    })
    .catch(error => next(error))
})

const formatName = (name) => {
  if (!name) return ''

  return name
    .trim()
    .split(/\s+/) // split by one or more spaces
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}



const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)
app.use(errorHandler)

// PORT: render provides port #
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})