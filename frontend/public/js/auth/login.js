document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const errorMessage = document.getElementById('errorMessage');
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Save the token in localStorage or sessionStorage
        //localStorage.setItem('token', data.token);
        //localStorage.setItem('username', data.username);
        // Redirect to the dashboard
        window.location.href = '/';
      } else {
        // Show error message
        //document.getElementById('errorMessage').classList.remove('hidden');
        errorMessage.textContent = data.message;
      }
    } catch (error) {
      console.error('Error during login:', error);
      //document.getElementById('errorMessage').classList.remove('hidden');
      errorMessage.textContent = 'An unexpected error occurred';
    }
  });