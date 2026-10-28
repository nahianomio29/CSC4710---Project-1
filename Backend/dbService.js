const mysql = require('mysql');
const dotenv = require('dotenv');
const crypto = require('crypto');

dotenv.config();

const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.DB_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT
});

connection.connect((err) => {
    if (err) {
        console.log('Database connection error: ' + err.message);
    } else {
        console.log('Database connected!');
    }
});

// Run a query safely using parameter values
function runQuery(query, values) {
    return new Promise((resolve, reject) => {
        connection.query(query, values, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

// Hash the password before saving or checking it
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

class DbService {
    // 1. Register a new user
    async registerUser(username, password, firstname, lastname, salary, age) {
        const hashedPassword = hashPassword(password);

        const query = `
            INSERT INTO Users
            (username, password, firstname, lastname, salary, age, registerday, signintime)
            VALUES (?, ?, ?, ?, ?, ?, CURDATE(), NULL)
        `;

        return await runQuery(query, [
            username, hashedPassword, firstname, lastname, salary, age
        ]);
    }

    // 2. Sign in
    async signIn(username, password) {
        const hashedPassword = hashPassword(password);

        const rows = await runQuery(
            'SELECT username FROM Users WHERE username = ? AND password = ?',
            [username, hashedPassword]
        );

        if (rows.length === 0) {
            return false;
        }

        await runQuery(
            'UPDATE Users SET signintime = NOW() WHERE username = ?',
            [username]
        );

        return true;
    }

    // 3. Search by first name, last name, or both
    async searchByName(first, last) {
        let query = 'SELECT * FROM Users WHERE 1=1';
        const values = [];

        if (first !== '') {
            query += ' AND firstname LIKE ?';
            values.push('%' + first + '%');
        }

        if (last !== '') {
            query += ' AND lastname LIKE ?';
            values.push('%' + last + '%');
        }

        return await runQuery(query, values);
    }

    // 4. Search by userid (username)
    async searchByUsername(username) {
        return await runQuery(
            'SELECT * FROM Users WHERE username = ?',
            [username]
        );
    }

    // 5. Search salary between X and Y
    async searchBySalary(min, max) {
        return await runQuery(
            'SELECT * FROM Users WHERE salary BETWEEN ? AND ?',
            [min, max]
        );
    }

    // 6. Search age between X and Y
    async searchByAge(min, max) {
        return await runQuery(
            'SELECT * FROM Users WHERE age BETWEEN ? AND ?',
            [min, max]
        );
    }

    // 7. Users registered after a specified user
    async registeredAfter(username) {
        const query = `
            SELECT * FROM Users
            WHERE registerday > (
                SELECT registerday FROM Users WHERE username = ?
            )
        `;

        return await runQuery(query, [username]);
    }

    // 8. Users who never signed in
    async neverSignedIn() {
        return await runQuery(
            'SELECT * FROM Users WHERE signintime IS NULL',
            []
        );
    }

    // 9. Users registered on the same day as a specified user
    async registeredSameDay(username) {
        const query = `
            SELECT * FROM Users
            WHERE registerday = (
                SELECT registerday FROM Users WHERE username = ?
            )
            AND username != ?
        `;

        return await runQuery(query, [username, username]);
    }

    // 10. Users registered today
    async registeredToday() {
        return await runQuery(
            'SELECT * FROM Users WHERE registerday = CURDATE()',
            []
        );
    }
}

module.exports = new DbService();