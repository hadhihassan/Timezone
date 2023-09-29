const username = document.getElementById('name').value;
const mbn = document.getElementById('mbn').value;
const gender = document.getElementById('gender').value;
const email = document.getElementById('email').value;
const password = document.getElementById('password').value;
const conformpassword = document.getElementById('conformpassword').value;

function validateForm() {
 

    // Basic validation checks (you can add more as needed)
    if (username.trim() === '') {
        displayErrorMessage('Name is required');
      
        return false;
    }

    if (mbn.trim() === '') {
        displayErrorMessage('Mobile number is required');
        return false;
    }

    if (gender.trim() === '') {
        displayErrorMessage('Gender is required');
        return false;
    }

    if (email.trim() === '' || !isValidEmail(email)) {
        displayErrorMessage('Valid email is required');
        return false;
    }

    if (password.trim() === '') {
        displayErrorMessage('Password is required');
        return false;
    }

    if (conformpassword.trim() === '' || conformpassword !== password) {
        displayErrorMessage('Passwords must match');
        return false;
    }
    // If all validations pass, submit the form
    return true;
}
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
function displayErrorMessage(message) {
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.textContent = message;
}
conformpassword.addEventListener('input', validateAllfields);
function validateAllfields (){
    validateForm()
}
