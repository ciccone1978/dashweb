const app = require('./app');
const PORT = process.env.PORT || 4000;

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
