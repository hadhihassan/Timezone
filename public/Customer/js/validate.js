const { emit } = require("../../../Models/customerModel");


function validateForm() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (name === '' || email === '' || password === '') {
        alert('All fields are required');
        return false;
    }
    if (!isValidEmail(email)) {
        alert('Invalid email format');
        return false;
    }

    return true;
}

function isValidEmail(email) {
    // Use a regular expression to validate the email format
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
