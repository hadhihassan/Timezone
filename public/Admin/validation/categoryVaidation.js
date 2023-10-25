const CategoryForm = document.getElementById("CategoryForm")

const imageInput = document.getElementById("image")
const imageError = document.getElementById("imageError")

const nameInput = document.getElementById("name")
const nameError = document.getElementById("nameError")

const descriptionInput = document.getElementById("description")
const descriptionError = document.getElementById("DescriptionError")
const ch = /^\d+$/;
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
function imageValidation (){
    const lenimages = imageInput.files.length
    if(lenimages === 0){
        imageError.innerHTML = "One image is requried.."
        return false
    }else{
        imageError.innerHTML = ""
        return true
    }
}
CategoryForm.addEventListener("submit", function (event) {
    event.preventDefault();
    // Run all validations and store the results in an array
    const validations = [
        descriptionValidation(),
        nameValidation(),
        imageValidation(),
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
            CategoryForm.submit();
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
