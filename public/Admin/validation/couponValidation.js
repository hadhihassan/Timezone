const couponForm = document.getElementById("couponForm")

const nameInput = document.getElementById("name")
const nameError = document.getElementById("nameError")

const descriptionInput = document.getElementById("Description")
const descriptionError = document.getElementById("descriptionErrorMessgae")
const ch = /^\d+$/;

const typeInput = document.getElementById("type")
const typeError = document.getElementById("typeError")

const  amountInput = document.getElementById("MinimumpurchaseAmount")
const  amountError = document.getElementById("miError")

const  amountoptioInput = document.getElementById("dOrp")
const  amountoptionError = document.getElementById("amountError")

function discountOptionValidation (){
    const amount = amountoptioInput.value
    if(amount === ""){
        amountoptionError.innerHTML = "this fiels is required.."
        return false
    } if(!ch.test(amount)){
        amountoptionError.innerHTML = "Amount must be number only..."
        return false
    }else if(typeInput.value === "Percentage"){
        if(amount > 100){
            amountoptionError.innerHTML = "Percentage must be under 100%..."
            return false
        }else{
            amountoptionError.innerHTML = ""
            return true
        }
    }else {
        amountoptionError.innerHTML = ""
        return true
    }
}
function MinimumpurchaseAmountValidation (){
    const amount = amountInput.value.trim()
     if(amount === ""){
        amountError.innerHTML = "Amount is required.."
        return false
    }else if(!ch.test(amount)){
        amountError.innerHTML = "Amount must be number only..."
        return false
    }else {
        amountError.innerHTML = ""
        return true
    }
}
function typeVaidation (){
    const value = typeInput.value
    if(value === "-1"){
        typeError.innerHTML = "Discount Type is requried.."
        return false
    }else{
        typeError.innerHTML = ""
        return true
    }
}
function descriptionValidation (){
    const sdescriptionValue = descriptionInput.value.trim()
    if(sdescriptionValue === ""){
        descriptionError.innerHTML = "Description is requred.."
        return false
    }else if(ch.test(sdescriptionValue)) {
        descriptionError.innerHTML = "Description only includes the letters.."
        return false
    }else if(sdescriptionValue.length < 10){
        descriptionError.innerHTML = "Description must be greater then 10 letters.."
        return false
    }else{
        descriptionError.innerHTML = ""
        return true
    }
}
function nameValidation (){    
    const nameValue = nameInput.value.trim()
    if(nameValue === ""){
        nameError.innerHTML = "name is required.."
        return false
    }else if(ch.test(nameValue)){
        nameError.innerHTML = "number not allowed, only letters"
        return false
    }else{
        nameError.innerHTML = ""
        return true
    }
}
couponForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const validations = [
        descriptionValidation(),
        nameValidation(),
        typeVaidation(),
        MinimumpurchaseAmountValidation(),
        discountOptionValidation()
    ];
    const hasErrors = validations.some(validation => validation === false);
    if (!hasErrors) {
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Form submitted successfully!',
        }).then(() => {
            couponForm.submit();
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Please fix the form errors before submitting.',
        });
    }
});
