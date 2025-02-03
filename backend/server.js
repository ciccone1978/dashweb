const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000; // Use environment variable for production


// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend/views')));

// Ensure CSS is served properly
app.use('/css', express.static(path.join(__dirname, '../frontend/css')));
app.use('/assets/images', express.static(path.join(__dirname, '../frontend/assets/images')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/index.html'));
});

app.get('/api', (req, res) => {
    res.json({ message: "Hello from the backend!" });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
