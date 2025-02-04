document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Save the token in localStorage or sessionStorage
        localStorage.setItem('token', data.token);
        // Redirect to the dashboard
        window.location.href = '/';
      } else {
        // Show error message
        document.getElementById('errorMessage').classList.remove('hidden');
      }
    } catch (error) {
      console.error('Error during login:', error);
      document.getElementById('errorMessage').classList.remove('hidden');
    }
  });