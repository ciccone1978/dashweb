const axios = window.axios;

// Create an Axios instance
const api = axios.create({
    baseURL: '/', // Base URL for all requests
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Send cookies with cross-origin requests
});

// --- Request Interceptor ---
api.interceptors.request.use(
    (config) => {
        // Client-side logging (basic info)
        console.log(`[Request] ${config.method.toUpperCase()} ${config.url}`);

        // Add a unique request ID (for server-side correlation)
        config.headers['X-Request-ID'] = generateRequestId();

        return config;
    },
    (error) => {
        // Client-side logging (basic error info)
        console.error('[Request Error]', error);
        return Promise.reject(error);
    }
);

// --- Response Interceptor ---
api.interceptors.response.use(
    (response) => {
        // Client-side logging (basic info)
        console.log(`[Response] ${response.status} ${response.config.url}`);
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Client-side logging (basic error info)
        console.error('[Response Error]', error.response ? error.response.status : error.message, error.config.url);


        // If the error is a 401 and we haven't already tried to refresh...
        if (error.response && error.response.status === 401 && 
            !originalRequest._retry && originalRequest.url !== '/auth/login') {
            originalRequest._retry = true;

            try {
                // Attempt to refresh the token
                const refreshResponse = await axios.post('/auth/refresh-token');

                if (refreshResponse.status === 200) {
                    return api(originalRequest);
                } else {
                    window.location.href = '/auth/login';
                    return Promise.reject(new Error('Refresh token failed'));
                }
            } catch (refreshError) {
                window.location.href = '/auth/login';
                return Promise.reject(refreshError);
            }
        }
        // For other errors, redirect to login page.
        if(error.response && error.response.status === 403){
             window.location.href = '/auth/login';
        }

        return Promise.reject(error);
    }
);

// --- Helper function to generate a unique request ID ---
function generateRequestId() {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
}

// --- Export the Axios instance ---
export { api };