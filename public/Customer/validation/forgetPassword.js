const passwordInput = document.getElementById("password");
const passwordErrorMessage = document.getElementById("newpasswordErrorMessage");
const confirmPasswordInput = document.getElementById("conformpassword");
const confirmPasswordErrorMessage = document.getElementById("confirmpasswordErrormessage");

const otpInput = document.getElementById("otp")
const otpErrro = document.getElementById("otpError")
const myForm = document.getElementById("forgetPassword")

function otpvalidatio() {
    const value = otpInput.value.trim();
    if (value === "") {
        otpErrro.textContent = "Otp is requred..";
        return false;otpvalidatio
    } else {
        otpErrro.textContent = "";
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
    if(confirmPassword === ""){
        confirmPasswordErrorMessage.textContent = "Confirm password is required";
        return false;
    }else if(confirmPassword !== originalPassword) {
        confirmPasswordErrorMessage.textContent = "The passwords do not match";
        return false;
    } else {
        confirmPasswordErrorMessage.textContent = "";
        return true;
    }
}

myForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();
    const ot = otpvalidatio()

    if (isPasswordValid && isConfirmPasswordValid && ot) {
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