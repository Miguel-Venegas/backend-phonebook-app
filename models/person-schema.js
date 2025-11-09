require('dotenv').config();
const mongoose = require('mongoose');


function isValidPhoneNumber(number) {
    const dashCount = (number.match(/-/g) || []).length;
    if (dashCount !== 1) return false;

    const dashIndex = number.indexOf('-')
    if (dashIndex < 2 || dashIndex > 3) return false;

    const parts = number.split('-')
    const [firstPart, secondPart] = parts

    if (isNaN(firstPart) || isNaN(secondPart)) return false;
    if (firstPart.length < 2 || firstPart.length > 3) return false;

    const totalDigits = firstPart.length + secondPart.length
    if (totalDigits < 8) return false;

    return true;
}


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

    name: {
        type: String,
        minLength: 3,
        required: true
    },

    number: {
        type: String,
        minLength: 8,
        maxlength: 15,
        required: [true, 'Phone number is required'],
        validate: {
            validator: isValidPhoneNumber, // 3️⃣ plug it in here
            message: props =>
                `${props.value} is not a valid phone number! Use format xx-1234567 or xxx-12345678`
        }
    }
});

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
});

module.exports = mongoose.model('Person', personSchema);