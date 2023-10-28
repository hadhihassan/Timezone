const passwordInput = document.getElementById('password');
const passwordErrorMessage = document.getElementById('passwordErrorMessage');
const emailInput = document.getElementById("email")
const emailErrorMessage = document.getElementById("emailErrorMessage")
const showPasswordCheckbox = document.getElementById('showPasswordCheckbox');
const form = document.getElementById("loginForm")
showPasswordCheckbox.addEventListener('change', () => {
    passwordInput.type = showPasswordCheckbox.checked ? 'text' : 'password';
});
showPasswordCheckbox.addEventListener('change', () => {
passwordInput.type = showPasswordCheckbox.checked ? 'text' : 'password';
});
function validatePassword() {
    const password = passwordInput.value;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+[\]{}|\\:;'"<>,.?/~`]/.test(password);
    if (password === "") {
        passwordErrorMessage.textContent = "Password is requred";
        return false;
    } else if (password.length < 8) {
        passwordErrorMessage.textContent = "Password must have at least 8 characters";
        return false;
    } else if (!(hasUppercase && hasLowercase && hasNumbers && hasSpecialChars)) {
        passwordErrorMessage.textContent = "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character"
        return false;
    } else {
        passwordErrorMessage.textContent = "";
        return true;
    }
}
function validateEmail() {
    const email = emailInput.value.trim();

    if (!/^\S+@\S+\.\S+$/.test(email)) {
        emailErrorMessage.textContent = "Please enter a valid email address.";
        return false;
    } else {
        emailErrorMessage.textContent = "";
        return true;
    }
}

form.addEventListener("submit", function (event) {
    event.preventDefault();


    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();


    if (isEmailValid && isPasswordValid) {
        // Form is valid, you can proceed with form submission

        // Show a success message using SweetAlert

        // Proceed with form submission
        form.submit();

    } else {
        // Show an error message using SweetAlert
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Please fix the form errors before submitting.',
        });
    }

});