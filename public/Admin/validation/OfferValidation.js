const OfferForm = document.getElementById("Offer-Form")

const nameInput = document.getElementById("Offername")
const nameError = document.getElementById("nameError")

const discountInput = document.getElementById("discount")
const discountError = document.getElementById("dicountError")

const expireInput = document.getElementById("ExpaireDate")
const expireError = document.getElementById("expireError")

const startingInput = document.getElementById("startingdate")
const startingError = document.getElementById("startingError")

const statusInput = document.getElementById("Status")
const statusError = document.getElementById("status")

function stausValidation() {
    const ch = /^\d+$/;
    const statusValue = statusInput.value.trim()
    if (statusValue === "") {
        statusError.innerHTML = "status is requried.."
        return false
    } else if (ch.test(statusValue)) {
        statusError.innerHTML = "Staus not a number only letters.."
        return false
    } else {
        statusError.innerHTML = ""
        return true
    }
}
function startingdateValidation() {
    const strtingvalue = startingInput.value
    if (strtingvalue === "") {
        startingError.innerHTML = "Offer starting date is requred.. "
        return false
    } else if (strtingvalue === expireInput.value || strtingvalue > expireInput.value) {
        startingError.innerHTML = "Offer starting date not equal to the expire date OR starting date not greater than the expire date .. "
        return false
    } else {
        startingError.innerHTML = ""
        return true

    }
}
function expireDateValidation() {
    const dateValue = expireInput.value
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
    if (dateValue === "") {
        expireError.innerHTML = "Expire date is required"
        return false
    } else if (formattedDate > dateValue) {
        expireError.innerHTML = "Expire date must be a valid state"
        return false
    } else {
        expireError.innerHTML = ""
        return true
    }
}
function discountValidation() {
    const dicoutnValue = discountInput.value.trim()
    const mobileNumberPattern = /^\d+$/;
    if (dicoutnValue === "") {
        discountError.innerHTML = "Discount is required.."
        return false
    } else if (!mobileNumberPattern.test(dicoutnValue)) {
        discountError.innerHTML = "Offer Discount must be a number"
    } else if (dicoutnValue === 0) {
        discountError.innerHTML = "Offer Discount must be greater than zero.."
    } else {
        discountError.innerHTML = ""
        return true
    }
}
function nameValidation() {
    const namePattern = /^\d+$/;
    const nameValue = nameInput.value.trim()
    if (nameValue === "") {
        nameError.innerHTML = "Offer name is requires..."
        return false
    } else if (namePattern.test(nameValue)) {
        nameError.innerHTML = "Offer name must be letters ..."
        return false
    } else {
        nameError.innerHTML = ""
        return true
    }
}
OfferForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Run all validations and store the results in an array
    const validations = [
        discountValidation(),
        nameValidation(),
        expireDateValidation(),
        startingdateValidation(),
        stausValidation()


    ];
    // Check if any validation failed
    const hasErrors = validations.some(validation => validation === false);

    if (!hasErrors) {
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Form submitted successfully!',
        }).then(() => {
            // Proceed with form submission
            OfferForm.submit();
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
