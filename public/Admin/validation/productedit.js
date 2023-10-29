const prouctInput = document.getElementById("productName")
const pnameErrorMessgae = document.getElementById("pnameErrorMessgae")
const manufacturerNameInput = document.getElementById("manufacturerName")
const mnameErrorMessgae = document.getElementById("mnameErrorMessgae")
const brandInput = document.getElementById("brandName")
const brandNameErrorMessage = document.getElementById("brandNameErrorMessage")
const id = document.getElementById("idNo")
const idErrorMessgae = document.getElementById("idErrorMessgae")
const priceInput = document.getElementById("price")
const priceErrorMessgae = document.getElementById("priceErrorMessgae")
const deccriptionInput = document.getElementById("description")
const descriptionErrorMessgae = document.getElementById("descriptionErrorMessgae")
const imageInput = document.getElementById("imagelength")
const imageserrormessage = document.getElementById("imageserrormessage")
const stock = document.getElementById("stockCount")
const stockErrorMessage = document.getElementById("stockErrorMessage")
const categoryinput = document.getElementById("category")
const categoryErrorMessgae = document.getElementById("categoryErrorMessgae")
const productForm = document.getElementById("productForm")
const tagInput = document.getElementById("tags")
const tasErrorMEssage = document.getElementById("tagsErrorMessgae")
const colorInput = document.getElementById("color")
const colorError = document.getElementById("colorErrorMessage")
const meterialInput = document.getElementById("Metrial")
const meterialErrorMessage = document.getElementById("MetrialErrorMessaeg")

function meterialValidation() {
    const col = meterialInput.value
    if (col == "-1") {
        meterialErrorMessage.innerHTML = "Product material is requried"
        return false
    } else {
        meterialErrorMessage.innerHTML = ""
        return true
    }
}

function colorValidation() {
    const col = colorInput.value
    if (col == "-1") {
        colorError.innerHTML = "Product color is requried"
        return false
    } else {
        colorError.innerHTML = ""
        return true
    }
}
function imageValidation() {
    const img = imageInput.value
    if (img < 2) {
        imageserrormessage.innerHTML = "3 images requried"
        return false
    } else {
        imageserrormessage.innerHTML = ""
        return true
    }
}
function ptags() {
    const tags = tagInput.value
    if (tags === "") {
        tasErrorMEssage.innerHTML = "Product tags is required.."
        return false
    } else {
        tasErrorMEssage.innerHTML = ""
        return true
    }
}

function nameValidation() {
    const nameValue = prouctInput.value.trim()

    if (nameValue === "") {
        pnameErrorMessgae.innerHTML = "Product name is required.."
        return false
    } else {
        pnameErrorMessgae.innerHTML = ""
        return true
    }
}

function manufacturerNameValidation() {
    const nameValue = manufacturerNameInput.value.trim()
    if (nameValue === "") {
        mnameErrorMessgae.innerHTML = "manufacturer name is required.."
        return false
    } else {
        mnameErrorMessgae.innerHTML = ""
        return true
    }
}

function bransNameVAlidation() {
    const nameValue = brandInput.value.trim()
    if (nameValue === "") {
        brandNameErrorMessage.innerHTML = "Brand name is required.."
        return false
    } else {
        brandNameErrorMessage.innerHTML = ""
        return true
    }
}

function priceVAlidation() {
    const price = priceInput.value.trim()
    const mobileNumberPattern = /^\d+$/;
    if (price === "") {
        priceErrorMessgae.innerHTML = "Price is required.."
        return false
    } else if (!mobileNumberPattern.test(price)) {
        priceErrorMessgae.innerHTML = "Enter numbers only.."
        return false
    } else {
        priceErrorMessgae.innerHTML = ""
        return true
    }
}

function descriptionVAlidation() {
    const deccription = deccriptionInput.value.trim()
    if (deccription === "") {
        descriptionErrorMessgae.innerHTML = "description is required.."
        return false
    } else if (deccription.length < 10) {
        descriptionErrorMessgae.innerHTML = "Enter the description at least 10 letters.."
        return false
    } else {
        descriptionErrorMessgae.innerHTML = ""
        return true
    }
}



function stockVAlidation() {
    const stockcount = stock.value
    if (stockcount === "") {
        stockErrorMessage.innerHTML = "product stock is required.."
        return false
    } else {
        stockErrorMessage.innerHTML = ""
        return true
    }
}


function idVAlidation() {
    const idvalus = id.value
    if (idvalus === "") {
        idErrorMessgae.innerHTML = "Identification No is required.."
        return false
    } else {
        idErrorMessgae.innerHTML = ""
        return true
    }
}


function categoryValidation() {
    const categoryValue = categoryinput.value
    if (categoryValue === " ") {
        categoryErrorMessgae.innerHTML = "Categories is required..."
        return false
    } else {
        categoryErrorMessgae.innerHTML = ""
        return true
    }
}
productForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Run all validations and store the results in an array
    const validations = [
        nameValidation(),
        manufacturerNameValidation(),
        bransNameVAlidation(),
        priceVAlidation(),
        descriptionVAlidation(),
        stockVAlidation(),
        idVAlidation(),
        categoryValidation(),
        ptags(),
        imageValidation(),
        colorValidation(),
        meterialValidation()
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
            productForm.submit();
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
