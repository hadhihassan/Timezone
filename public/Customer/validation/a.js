const form = document.getElementById("Reportmanagment");
const startingDate = document.getElementById("starting");
const startingError = document.getElementById("startingDateError");
const endingDate = document.getElementById("ending");
const endingError = document.getElementById("endingError");

form.addEventListener("submit", function (event) {
  event.preventDefault();

  function isDateValid(dateString) {
    const regexPattern = /^\d{4}-\d{2}-\d{2}$/;
    return regexPattern.test(dateString);
  }

  function nameValidation() {
    const value = startingDate.value;
    const currentDate = new Date();

    if (value === "") {
      startingError.innerHTML = "Starting date is required";
      return false;
    } else if (!isDateValid(value)) {
      startingError.innerHTML = "Date is not valid or does not match the format.";
      return false;
    } else if (new Date(value) > currentDate) {
      startingError.innerHTML = "Starting date must be a valid date";
      return false;
    } else {
      startingError.innerHTML = "";
      return true;
    }
  }

  function mobileValidation() {
    const value = startingDate.value;
    const endingvalue = endingDate.value;
    const currentDate = new Date();

    if (endingvalue === "") {
      endingError.innerHTML = "Ending date is required";
      return false;
    } else if (!isDateValid(endingvalue)) {
      endingError.innerHTML = "Date is not valid or does not match the format.";
      return false;
    } else if (new Date(endingvalue) > currentDate) {
      endingError.innerHTML = "Ending date must be a valid date";
      return false;
    } else if (value && endingvalue) {
      if (new Date(endingvalue) < new Date(value)) {
        endingError.innerHTML = "Ending date must be after the starting date";
        return false;
      }
    } else {
      endingError.innerHTML = "";
      return true;
    }
  }

  // Run all validations and store the results in an array
  const validations = [nameValidation(), mobileValidation()];

  // Check if any validation failed
  const hasErrors = validations.some(validation => validation === false);

  if (!hasErrors) {
    // Proceed with form submission
    form.submit();
  }else{
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please fix the form errors before submitting.',
    });
  }
});
