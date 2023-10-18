const mbnInput = document.getElementById("mbn");
const usernameInput = document.getElementById('name')
const nameErrorMessage = document.getElementById("nameErrorMessgae");
const mbnErrorMessage = document.getElementById("mbnErrorMessage");
const emailErrorMessage = document.getElementById("emailErrorMessage");
const emailInput = document.getElementById('email')

const passwordInput = document.getElementById('password')
const passwordErrorMessage = document.getElementById("passwordErrorMessage");

const conformpasswordInput = document.getElementById('conformpassword')
const conformpasswordErrorMessage = document.getElementById("conformpasswordErrorMessage");


const myForm = document.getElementById("myForm");
let allFieldsValid = true


//mobile number form validation
function mobile() {
    let mobileValided = true
    mbnInput.addEventListener("input", function () {
        const mobileNumber = this.value.toString(); // Convert the value to a string
        const zeroCount = (mobileNumber.match(/0/g) || []).length;
        const mobileNumberPattern = /^\d+$/;
        if (!mobileNumberPattern.test(mobileNumber)) {
            mobileValided = false
            mbnErrorMessage.textContent = 'Invalid mobile number. Please enter number.';
        } else if (zeroCount > 5) {
            mobileValided = false
            mbnErrorMessage.textContent = "too many the mobile number "
        } else if (mobileNumber.length === 0) {
            mobileValided = false
            mbnErrorMessage.textContent = "Mobile number is required"
        } else {
            mobileValided = true
            mbnErrorMessage.textContent = '';
        }
        
    });
    return mobileValided
}

//username validation form
function nameva() {
    let nameValidated = true
    usernameInput.addEventListener("input", function () {
        const name = this.value.trim();
        if (name === "") {
            nameValidated = false
            nameErrorMessage.textContent = "Username is required";
        } else if (name.length < 3) {
            nameValidated = false
            nameErrorMessage.textContent = "Username must be at least 4 characters";
        } else if (/^\d+$/.test(name)) {
            nameValidated = false
            nameErrorMessage.textContent = "Username cannot be all numbers";
        } else {
            allFieldsValid = true
            nameErrorMessage.textContent = "";
        }
    })
    return nameValidated

}
//email validation form
function email() {
    let emailValidated = true
    emailInput.addEventListener("input", function () {
        let email = this.value
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            emailValidated = false
            emailErrorMessage.textContent = "The not a valid. please enter the valid email address..."
        } else {
            emailValidated = true
            emailErrorMessage.textContent = ""
        }
    })
    return emailValidated

}

function password (){
    let passowrdValidated =  true
    passwordInput.addEventListener("input", function (){
        let password = this.value

        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);

        if(password.length < 8){
            passowrdValidated = false
            passwordErrorMessage.textContent = 'Password must have at least 8 characters'
        }else if(!(hasUppercase && hasLowercase && hasNumbers)){
            passowrdValidated = false
            passwordErrorMessage.textContent = 'Password must include at least one uppercase letter, one lowercase letter, and one number';
        }else{ 
            passowrdValidated = true
            passwordErrorMessage.textContent = ""
        }
    })
    return passowrdValidated
}
confirmPassword()
function confirmPassword(){
    let confirmpassValidated = true
    conformpasswordInput.addEventListener("input", function (){
        let confirmpassword = this.value
        let opassword = passwordInput.value
        console.log(confirmpassword,opassword);
        
        if(confirmpassword !== opassword){
            confirmpassValidated = false
            conformpasswordErrorMessage.textContent = "The password is  miss match"
        }else{
            confirmpassValidated = true
            conformpasswordErrorMessage.textContent = ""
        }
    })
    return confirmpassValidated

}  

mobile();
email();
password();
confirmPassword();
nameva();
myForm.addEventListener("submit", function (event) {
    const mbn = mobile();
    const em = email();
    const pas = password();
    const cpass = confirmPassword();
    const na = nameva();

    if (!(mbn && em && pas && cpass && na)) {
        event.preventDefault();
    } else {
        Swal.fire({
            title: 'Are you sure you want to sign up?',
            text: 'This form will be submitted',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Submit',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                // If the user confirms, submit the form
                myForm.submit();
            }
        });
    }
});

