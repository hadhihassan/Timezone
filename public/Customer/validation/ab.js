// your-client-script.js
document.addEventListener("DOMContentLoaded", () => {
    const fetchDataButton = document.getElementById("fetchDataButton");
  
    fetchDataButton.addEventListener("click", async () => {
      // Show a loading alert
      const loadingAlert = await Swal.fire({
        title: "Fetching Data...",
        allowOutsideClick: false,
        onBeforeOpen: () => {
          Swal.showLoading();
        },
      });
  
      try {
        // Make an AJAX request to your Express server to fetch data
        const response = await fetch("/fetch-data");
        const data = await response.json();
  
        // Handle the fetched data (e.g., update the UI)
        if (response.status === 200) {
          // Data fetched successfully
          // Update the UI with the fetched data
          console.log(data);
  
          // Close the loading alert
          loadingAlert.close();
        } else {
          // Handle errors or show an error message
          console.error("Error fetching data");
          // Close the loading alert
          loadingAlert.close();
        }
      } catch (error) {
        // Handle network or request errors
        console.error("Network error", error);
        // Close the loading alert
        loadingAlert.close();
      }
    });
  });
  