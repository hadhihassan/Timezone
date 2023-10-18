document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();
    Swal.fire({
       title: 'Are you sure?',
       text: 'This form will be submitted',
       icon: 'warning',
       showCancelButton: true,
       confirmButtonText: 'Submit',
       cancelButtonText: 'Cancel'
    }).then((result) => {
       if (result.isConfirmed) {
          this.submit();
       }
    });
 });