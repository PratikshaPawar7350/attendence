/*const express = require('express');
const dotenv = require('dotenv');
const routes = require('./routes/routes');
const cors = require('cors'); // Importing the cors package
const bodyParser = require('body-parser');
const app = express();
dotenv.config();

app.use(express.json());
app.use(express.json({ limit: '300mb' }));
app.use(bodyParser.json({ limit: '300mb' })); // Increase limit for JSON request body
app.use(bodyParser.urlencoded({ limit: '300mb', extended: true }));
app.use(cors());
 // Ensure express can parse JSON bodies
app.use('/', routes);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server is running on port ${port}`));
*/
const express = require('express');
const dotenv = require('dotenv');
const routes = require('./routes/routes');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
dotenv.config();

app.use(cors());
app.use(express.json({ limit: '300mb' }));
app.use(bodyParser.json({ limit: '300mb' }));
app.use(bodyParser.urlencoded({ limit: '300mb', extended: true }));

app.use('/', routes);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server is running on port ${port}`));
