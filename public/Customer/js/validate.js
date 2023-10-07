// Get references to the day and month elements
var dayElement = document.getElementById("day");
var monthElement = document.getElementById("month");

// Create a Date object for the current date
var currentDate = new Date();

// Define an array of month names
var monthNames = [
    "Jan", "Feb", "Mar", "Apr",
    "May", "Jun", "Jul", "Aug",
    "Sep", "Oct", "Nov", "Dec"
];

// Get the day and month
var day = currentDate.getDate();
var month = monthNames[currentDate.getMonth()];

// Set the content of the day and month elements
dayElement.textContent = day;
monthElement.textContent = month;