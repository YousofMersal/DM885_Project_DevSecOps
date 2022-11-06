const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT;

app.get('/', function (req, res) {
  res.json({ id: 0, name: `test` });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
