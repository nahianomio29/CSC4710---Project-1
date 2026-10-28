// Show users in the results table
function loadTable(data) {
    const table = document.querySelector('#table tbody');
    table.innerHTML = '';

    if (data.length === 0) {
        const row = table.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 7;
        cell.textContent = 'No Data';
        return;
    }

    data.forEach(function (user) {
        const row = table.insertRow();

        row.insertCell().textContent = user.username;
        row.insertCell().textContent = user.firstname;
        row.insertCell().textContent = user.lastname;
        row.insertCell().textContent = user.salary;
        row.insertCell().textContent = user.age;

        row.insertCell().textContent = user.registerday
            ? new Date(user.registerday).toLocaleDateString()
            : '';

        row.insertCell().textContent = user.signintime
            ? new Date(user.signintime).toLocaleString()
            : 'Never';
    });
}

// Call the backend and display the results
function getUsers(url) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                loadTable(data.data);
            }
        })
        .catch(() => alert('Could not connect to the server.'));
}

// Register
document.querySelector('#register-btn').onclick = function () {
    fetch('http://localhost:5050/register', {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({
            username: document.querySelector('#reg-username').value.trim(),
            password: document.querySelector('#reg-password').value,
            firstname: document.querySelector('#reg-firstname').value.trim(),
            lastname: document.querySelector('#reg-lastname').value.trim(),
            salary: document.querySelector('#reg-salary').value,
            age: document.querySelector('#reg-age').value
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('Error: ' + data.error);
            } else {
                alert('Registered!');
            }
        })
        .catch(() => alert('Could not connect to the server.'));
};

// Sign in
document.querySelector('#signin-btn').onclick = function () {
    fetch('http://localhost:5050/signin', {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({
            username: document.querySelector('#signin-username').value.trim(),
            password: document.querySelector('#signin-password').value
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('Error: ' + data.error);
            } else if (data.success) {
                alert('Sign in successful!');
            } else {
                alert('Wrong username or password.');
            }
        })
        .catch(() => alert('Could not connect to the server.'));
};

// Search by first name and/or last name
document.querySelector('#name-btn').onclick = function () {
    const first = document.querySelector('#first-input').value;
    const last = document.querySelector('#last-input').value;

    getUsers(
        'http://localhost:5050/searchName?first=' +
        encodeURIComponent(first) +
        '&last=' +
        encodeURIComponent(last)
    );
};

// Search by userid
document.querySelector('#username-btn').onclick = function () {
    const username = document.querySelector('#username-input').value.trim();

    getUsers('http://localhost:5050/searchUsername/' + encodeURIComponent(username));
};

// Search salary between X and Y
document.querySelector('#salary-btn').onclick = function () {
    const min = document.querySelector('#salary-min').value;
    const max = document.querySelector('#salary-max').value;

    getUsers('http://localhost:5050/salary/' + min + '/' + max);
};

// Search age between X and Y
document.querySelector('#age-btn').onclick = function () {
    const min = document.querySelector('#age-min').value;
    const max = document.querySelector('#age-max').value;

    getUsers('http://localhost:5050/age/' + min + '/' + max);
};

// Search users registered after the specified user
document.querySelector('#after-btn').onclick = function () {
    const username = document.querySelector('#john-input').value.trim();

    getUsers('http://localhost:5050/after/' + encodeURIComponent(username));
};

// Search users registered on the same day
document.querySelector('#sameday-btn').onclick = function () {
    const username = document.querySelector('#john-input').value.trim();

    getUsers('http://localhost:5050/sameDay/' + encodeURIComponent(username));
};

// Search users who never signed in
document.querySelector('#never-btn').onclick = function () {
    getUsers('http://localhost:5050/neverSignedIn');
};

// Search users registered today
document.querySelector('#today-btn').onclick = function () {
    getUsers('http://localhost:5050/today');
};