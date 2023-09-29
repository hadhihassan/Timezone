// Add an event listener to store the scroll position
window.addEventListener('scroll', function() {
    localStorage.setItem('scrollPosition', window.scrollY);
  });
  
  // Retrieve the scroll position from localStorage
  const storedScrollPosition = localStorage.getItem('scrollPosition');
  
  // Scroll to the stored position if it exists
  if (storedScrollPosition) {
    window.scrollTo(0, parseInt(storedScrollPosition));
  }
  