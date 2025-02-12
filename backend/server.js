const app = require('./app');
const PORT = process.env.PORT;
const BASE_URL = process.env.BASE_URL;

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running on ${BASE_URL}:${PORT}`);
});
