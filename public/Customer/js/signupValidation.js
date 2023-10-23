
const mbnInput = document.getElementById("mbn");
const usernameInput = document.getElementById("name");
const nameErrorMessage = document.getElementById("nameErrorMessgae");
const mbnErrorMessage = document.getElementById("mbnErrorMessage");
const emailErrorMessage = document.getElementById("emailErrorMessage");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const passwordErrorMessage = document.getElementById("passwordErrorMessage");
const confirmPasswordInput = document.getElementById("conformpassword");
const confirmPasswordErrorMessage = document.getElementById("conformpasswordErrorMessage");
const myForm = document.getElementById("myForm");

function validateMobile() {
    const mobileNumber = mbnInput.value.trim();
    const zeroCount = (mobileNumber.match(/0/g) || []).length;
    const mobileNumberPattern = /^\d+$/;
    
    if (!mobileNumberPattern.test(mobileNumber)) {
        mbnErrorMessage.textContent = "Invalid mobile number. Please enter numbers only.";
        return false;
    } else if (zeroCount > 5) {
        mbnErrorMessage.textContent = "Too many zeros in the mobile number.";
        return false;
    } else {
        mbnErrorMessage.textContent = "";
        return true;
    }
}

function validateName() {
    const name = usernameInput.value.trim();
    
    if (name === "") {
        nameErrorMessage.textContent = "Username is required";
        return false;
    } else if (name.length < 4) {
        nameErrorMessage.textContent = "Username must be at least 4 characters";
        return false;
    } else if (/^\d+$/.test(name)) {
        nameErrorMessage.textContent = "Username cannot be all numbers";
        return false;
    } else {
        nameErrorMessage.textContent = "";
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

function validatePassword() {
    const password = passwordInput.value;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+[\]{}|\\:;'"<>,.?/~`]/.test(password);

    if (password.length < 8) {
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

function validateConfirmPassword() {
    const confirmPassword = confirmPasswordInput.value;
    const originalPassword = passwordInput.value;

    if (confirmPassword !== originalPassword) {
        confirmPasswordErrorMessage.textContent = "The passwords do not match";
        return false;
    } else {
        confirmPasswordErrorMessage.textContent = "";
        return true;
    }
}

myForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const isMobileValid = validateMobile();
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();

    if (isMobileValid && isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid) {
        // Form is valid, you can proceed with form submission
        console.log("Form submitted successfully.");
    
        // Show a success message using SweetAlert
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Form submitted successfully!',
        }).then(() => {
            // Proceed with form submission
            myForm.submit();
        });
    } else {
        // Show an error message using SweetAlert
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Please fix the form errors before submitting.',
        });
    }
    
});
const passwordInp = document.getElementById('password');
const showPasswordCheckbox = document.getElementById('showPasswordCheckbox');
showPasswordCheckbox.addEventListener('change', () => {
    passwordInp.type = showPasswordCheckbox.checked ? 'text' : 'password';
});

