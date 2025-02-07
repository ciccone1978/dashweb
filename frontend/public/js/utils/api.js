// frontend/public/js/utils/api.js

async function fetchWithAuth(url, options = {}) {
    try {
        const response = await fetch(url, options);

        if (response.status === 401) {
            // Attempt to refresh the token
            const refreshResponse = await fetch('/auth/refresh-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (refreshResponse.ok) {
                // Retry the original request with the new access token
                return fetch(url, options); // Recursive call, but safe
            } else {
                // Refresh token is also invalid/expired, redirect to login
                window.location.href = '/auth/login';
                return Promise.reject('Refresh token failed');
            }
        }

        return response;
    } catch (error) {
        console.error('Fetch with auth error:', error);
        window.location.href = '/auth/login'; //redirect to login in any error
        return Promise.reject(error);
    }
}

export { fetchWithAuth }; // Export the function