
  // Get all input elements and increment/decrement buttons
  const inputNumbers = document.querySelectorAll(".input-number");
  const incrementButtons = document.querySelectorAll(".input-number-increment");
  const decrementButtons = document.querySelectorAll(".input-number-decrement");

  // Add click event listeners for all increment and decrement buttons
  incrementButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      updateCartItemQuantity(inputNumbers[index], "increment");
    });
  });

  decrementButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      updateCartItemQuantity(inputNumbers[index], "decrement");
    });
  });

  function updateCartItemQuantity(inputElement, action) {
    const cartItemId = inputElement.parentElement
      .querySelector(".input-number-increment")
      .getAttribute("data-cart-item-id");

    let currentValue = parseInt(inputElement.value);

    if (!isNaN(currentValue)) {
      if (action === "increment" && currentValue < 10) {
        currentValue++;
      } else if (action === "decrement" && currentValue > 1) {
        currentValue--;
      }
    }

    // Update the input value
    inputElement.value = currentValue;



    if (!isNaN(currentValue)) {
      $.ajax({
        url: "/update-cart-item-quantity", // Replace with your server-side route
        method: "POST", // or 'PUT' depending on your API
        data: {
          cartItemId: cartItemId,
          quantity: currentValue,
        },

        success: function (response) {
          if (response.stock) {
            displayFlashMessage(response.error)
          } else {
            console.log(response, 'res-out');
            if (response) {

              console.log(response, 'res');

              const newTotal = response.total;
              const cartTotal = document.querySelector(`#cart-total-amount_${cartItemId}`);
              cartTotal.textContent = newTotal;


              const subtotalAmount = response.totalCartAmount;
              const subtotalAmountElement =
                document.querySelector("#subtotalAmount"); // Add an ID to your total amount element
              subtotalAmountElement.textContent = `₹${subtotalAmount}`;

            } else {
              // Handle the error, e.g., display a message to the user
              console.error("Error in response:", response);
            }
          }
        }

        // error: function (error) {
        //       // Handle the AJAX error, e.g., display an error message
        //       console.error("AJAX error:", error);
        //     },
      });
    } else {
      // Handle the case where currentValue is not a valid number
      console.error("Invalid input value:", inputElement.value);
    }
  }




  function displayFlashMessage(message) {
    const flashMessageElement = document.getElementById('flash-message');
    flashMessageElement.textContent = message;
    flashMessageElement.style.display = 'block'; // Show the flash message

    setTimeout(() => {
      flashMessageElement.style.display = 'none'; // Hide the flash message after 3 seconds (adjust as needed)
    }, 4000);
  }


  $("#min-price").on("change mousemove", function () {
    min_price = parseInt($("#min-price").val());
    $("#min-price-txt").text("$" + min_price);
    showItemsFiltered();
});

$("#max-price").on("change mousemove", function () {
    max_price = parseInt($("#max-price").val());
    $("#max-price-txt").text("$" + max_price);
    showItemsFiltered();
});
