const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const path = require('path');
const app = express();
const port = 8080;

// Initialize Firebase Admin
const serviceAccount = require('./kalki-1cee9-firebase-adminsdk-gamyx-11e8925c50.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/home.html");
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + "/login.html");
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();

    if (!doc.exists) {
        console.log('No such user!');
        res.redirect('/login');
    } else {
        const userData = doc.data();
        const usern=userData.name;
        console.log(usern);
        if (userData.password === password) {
            console.log(`User ${email} logged in successfully`);
            res.redirect('https://www.vishnu.edu.in/Results.php');
        } else {
            console.log('Incorrect password');
            res.redirect('/login');
        }
    }
});

app.get('/signup', (req, res) => {
    res.sendFile(__dirname + "/sign.html");
});

app.post('/signup', async (req, res) => {
    const { name, email, password, dob } = req.body;
    const userRef = db.collection('users').doc(email); // Assuming email as the unique identifier
    const doc = await userRef.get();

    if (doc.exists) {
        console.log('User already exists');
        res.status(400).send('User already exists');
    } else {
        await userRef.set({
            name,
            email,
            password,
            dob
        });
        console.log('User registered');
        res.redirect('/');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
