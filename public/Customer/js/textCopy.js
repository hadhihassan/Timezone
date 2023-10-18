function copyCouponCode() {
    // Get the coupon code element
    var couponCodeElement = document.getElementById("couponCode");

    // Create a temporary input element to copy the code
    var tempInput = document.createElement("input");
    tempInput.value = couponCodeElement.textContent;

    // Append the input element to the body and select its content
    document.body.appendChild(tempInput);
    tempInput.select();

    // Copy the selected text to the clipboard
    document.execCommand("copy");

    // Remove the temporary input element
    document.body.removeChild(tempInput);
  }