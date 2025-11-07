require('dotenv').config();
const mongoose = require('mongoose');


mongoose.set('strictQuery', false)

const dbUsername = process.env.DB_USER;
const dbName = process.env.DB_NAME;
const dbPassword = process.env.DB_PASS;
const dbCluster = process.env.DB_CLUSTER;


const password = process.argv[2];
// const newPerson = process.argv[3];
// const newNumber = process.argv[4];

const url = `mongodb+srv://${dbUsername}:${password || dbPassword}@${dbCluster}/${dbName}?appName=Cluster0`;

console.log('connecting to', url);
mongoose.connect(url)

    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch(error => {
        console.log('error connecting to MongoDB:', error.message)
    })

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
});

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
});

module.exports = mongoose.model('Person', personSchema);