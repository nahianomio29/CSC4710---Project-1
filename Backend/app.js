const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const db = require('./dbService');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register
app.post('/register', async (request, response) => {
    const { username, password, firstname, lastname, salary, age } = request.body;

    if (!username || !password || !firstname || !lastname ||
        salary === '' || salary == null || age === '' || age == null) {
        return response.status(400).json({ error: 'Fill in every field.' });
    }

    try {
        await db.registerUser(username, password, firstname, lastname, salary, age);
        response.json({ success: true });
    } catch (err) {
        response.status(400).json({ error: err.message });
    }
});

// Sign in
app.post('/signin', async (request, response) => {
    const { username, password } = request.body;

    if (!username || !password) {
        return response.status(400).json({ error: 'Enter username and password.' });
    }

    try {
        const success = await db.signIn(username, password);
        response.json({ success: success });
    } catch (err) {
        response.status(500).json({ error: err.message });
    }
});

// Search by first name and/or last name
app.get('/searchName', async (request, response) => {
    try {
        const first = request.query.first || '';
        const last = request.query.last || '';
        const data = await db.searchByName(first, last);
        response.json({ data: data });
    } catch (err) {
        response.status(500).json({ error: err.message });
    }
});

// Search by userid
app.get('/searchUsername/:username', async (request, response) => {
    try {
        const data = await db.searchByUsername(request.params.username);
        response.json({ data: data });
    } catch (err) {
        response.status(500).json({ error: err.message });
    }
});

// Search salary between X and Y
app.get('/salary/:min/:max', async (request, response) => {
    try {
        const data = await db.searchBySalary(request.params.min, request.params.max);
        response.json({ data: data });
    } catch (err) {
        response.status(500).json({ error: err.message });
    }
});

// Search age between X and Y
app.get('/age/:min/:max', async (request, response) => {
    try {
        const data = await db.searchByAge(request.params.min, request.params.max);
        response.json({ data: data });
    } catch (err) {
        response.status(500).json({ error: err.message });
    }
});

// Users registered after a specified user
app.get('/after/:username', async (request, response) => {
    try {
        const data = await db.registeredAfter(request.params.username);
        response.json({ data: data });
    } catch (err) {
        response.status(500).json({ error: err.message });
    }
});

// Users who never signed in
app.get('/neverSignedIn', async (request, response) => {
    try {
        const data = await db.neverSignedIn();
        response.json({ data: data });
    } catch (err) {
        response.status(500).json({ error: err.message });
    }
});

// Users registered on the same day as a specified user
app.get('/sameDay/:username', async (request, response) => {
    try {
        const data = await db.registeredSameDay(request.params.username);
        response.json({ data: data });
    } catch (err) {
        response.status(500).json({ error: err.message });
    }
    });

// Users registered today
app.get('/today', async (request, response) => {
    try {
        const data = await db.registeredToday();
        response.json({ data: data });
    } catch (err) {
        response.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
    console.log('Server listening on port ' + PORT);
});