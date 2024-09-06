const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const path=require('path');
const port = 2004;

// Initialize Firebase
const serviceAccount = require('./kalki-1cee9-firebase-adminsdk-gamyx-11e8925c50.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    //databaseURL: 'https://<your-database-name>.firebaseio.com'
});

//app.use(express.static(path.join(__dirname, 'public')));

const db = admin.firestore();
const app = express();
app.use(bodyParser.json());

// Home route
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/home2.html");
});

// Sign up route
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
            password
        });
        console.log('User registered');
        res.redirect('/');
    }
});

// Login route
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
            res.redirect('');
        } else {
            console.log('Incorrect password');
            res.redirect('/login');
        }
    }
});

// Table reservation route
app.get('/reserve', (req, res) => {
    res.sendFile(__dirname + "/rtable2.html");
});
app.post('/reserve', async (req, res) => {
    const { name, phone, email, date, time, numberOfPeople, suggestions } = req.body;
    try {
        await db.collection('reservations').add({
            name: name,
            phone: phone,
            email: email,
            date: date,
            time: time,
            numberOfPeople: numberOfPeople,
            suggestions: suggestions
        });
        res.status(201).send('Table reserved successfully');
    } catch (error) {
        console.error('Error reserving table:', error);
        res.status(400).send('Error reserving table');
    }
});

// Menu route (get items)
app.get('/menu', (req, res) => {
    res.sendFile(__dirname + "/order.html");
});

app.get('/menu', async (req, res) => {
    try {
        const menuSnapshot = await db.collection('menu').get();
        const menuItems = menuSnapshot.docs.map(doc => doc.data());
        res.status(200).json(menuItems);
    } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(400).send('Error fetching menu');
    }
});

// Cart route (add items)
app.get('/cart', (req, res) => {
    res.sendFile(__dirname + "/cartpage.html");
});

app.post('/cart', async (req, res) => {
    const { email, items } = req.body;
    try {
        await db.collection('carts').doc(email).set({
            items
        });
        res.status(201).send('Cart updated successfully');
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(400).send('Error updating cart');
    }
});



// Address route
app.get('/address', (req, res) => {
    res.sendFile(__dirname + "/address.html");
});


app.post('/address', async (req, res) => {
    const { email, address } = req.body;
    try {
        await db.collection('users').doc(email).update({
            address
        });
        res.status(200).send('Address updated successfully');
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(400).send('Error updating address');
    }
});

// Order route
/*
app.get('/cart', (req, res) => {
    res.sendFile(__dirname + "/cartpage.html");
});


app.post('/order', async (req, res) => {
    const { email, items, totalPrice, address } = req.body;
    try {
        await db.collection('orders').add({
            email: email,
            items: items,
            totalPrice: totalPrice,
            address: address,
            orderDate: new Date()
        });
        res.status(201).send('Order placed successfully');
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(400).send('Error placing order');
    }
});
*/

// Start server
const PORT = process.env.PORT || 2004;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${port}`);
});
