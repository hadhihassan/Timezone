const form  = document.getElementById("addressForm")
const nameInput = document.getElementById("name")
const nameError = document.getElementById("nameErrorMessage")
// name 
const mobileInput = document.getElementById("mbn")
const mbnError = document.getElementById("mobileErrorMessage")
// mobile
const emailInput = document.getElementById("email")
const emailError = document.getElementById("emailErrorMessage")
// email
const houseInput = document.getElementById("houseno")
const houseError = document.getElementById("houseErrorMessage")
// house 
const areaInput = document.getElementById("area")
const areaError = document.getElementById("areaErrorMessage")
// area
const cityInput = document.getElementById("city")
const cityError = document.getElementById("cityErrorMessage")
// City
const pincodeInput = document.getElementById("pincode")
const pincodeError = document.getElementById("pincodeErrorMessage")
// PINCODE
const countryInput = document.getElementById("country")
const countryError = document.getElementById("countryErrorMessage")
var namePattern = /^[A-Za-z\- ']+$/;

function nameValidation (){
    const value = nameInput.value.trim()
    if(value === ""){
        nameError.innerHTML = "Name is required.."
        return false
    }else if (!namePattern.test(value)){
        nameError.innerHTML = `${value} is not a valid name.`
        return false
    }else{
        nameError.innerHTML = ""
        return true
    }
}
function mobileValidation (){
    const mobileNumber = mobileInput.value.trim();
    const zeroCount = (mobileNumber.match(/0/g) || []).length;
    const mobileNumberPattern = /^\d+$/;
    if(mobileNumber.length !== 10){
        mbnError.textContent = "Invalid mobile.. mobile number must be 10 digits";
        return false;
    }else if(!mobileNumberPattern.test(mobileNumber)) {
        mbnError.textContent = "Invalid mobile number. Please enter numbers only.";
        return false;
    } else if (zeroCount > 5) {
        mbnError.textContent = "Too many zeros in the mobile number.";
        return false;
    } else {
        mbnError.textContent = "";
        return true;
    }
}
function emailValidation (){
    const email = emailInput.value.trim();
    if(email === ""){
        emailError.textContent = "Please enter a valid email address.";
        return false;
    }else if(!/^\S+@\S+\.\S+$/.test(email)) {
        emailError.textContent = "Please enter a valid email address.";
        return false;
    } else {
        emailError.textContent = "";
        return true;
    }
}
function houseValidation (){
    const value = houseInput.value.trim()
    if(value === ""){
        houseError.innerHTML = "House name  is required.."
        return false
    }else if (!namePattern.test(value)){
        houseError.innerHTML = `${value} is not a valid house name.`
        return false
    }else{
        houseError.innerHTML = ""
        return true
    }
}
function areaValidation (){
       const mobileNumberPattern = /^\d+$/;
    const value = areaInput.value.trim()
    if(value === ""){
        areaError.innerHTML = "Area is required.."
        return false
    }else if (mobileNumberPattern.test(value)){
        areaError.innerHTML = `${value} is not a valid Area..`
        return false
    }else{
        areaError.innerHTML = ""
        return true
    }
}
function cityValidation (){
    const value = cityInput.value.trim()
    if(value === ""){
        cityError.innerHTML = "City is required.."
        return false
    }else if (!namePattern.test(value)){
        cityError.innerHTML = `${value} is not a valid city name..`
        return false
    }else{
        cityError.innerHTML = ""
        return true
    }
}

function pincodeValidation (){
    const mobileNumber = pincodeInput.value.trim();
    const zeroCount = (mobileNumber.match(/0/g) || []).length;
    const mobileNumberPattern = /^\d+$/;
    
    if (!mobileNumberPattern.test(mobileNumber)) {
        pincodeError.textContent = "Invalid pincode . Please enter numbers only.";
        return false;
    } else if (zeroCount > 5) {
        pincodeError.textContent = "Too many zeros in the  pincode .";
        return false;
    } else {
        pincodeError.textContent = "";
        return true;
    }
}

function countryValidation (){
    const value = countryInput.value.trim()
    if(value === ""){
        countryError.innerHTML = "Country name  is required.."
        return false
    }else if (!namePattern.test(value)){
        countryError.innerHTML = `${value} is not a valid country name..`
        return false
    }else{
        countryError.innerHTML = ""
        return true
    }
}


form.addEventListener("submit", function (event) {
    event.preventDefault();

    // Run all validations and store the results in an array
    const validations = [
        nameValidation (),
        mobileValidation(),
        emailValidation(),
        houseValidation(),
        areaValidation(),
        cityValidation(),
        pincodeValidation(),
        countryValidation()


    ];
    // Check if any validation failed
    const hasErrors = validations.some(validation => validation === false);

    if (!hasErrors) {
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Address Form submitted successfully!',
        }).then(() => {
            // Proceed with form submission
            form.submit();
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
