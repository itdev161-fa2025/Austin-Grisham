import express from 'express';
import connectDatabase from './config/db.js';

const app = express();
connectDatabase();

// Middleware to parse incoming JSON
app.use(express.json());

app.get('/', (_req, res) => 
    res.send('http get request sent to root api endpoint')
);

// POST route to log and return the request body
app.post('/user', (req, res) => {
    console.log(req.body);  // Log the request body
    res.json(req.body);     // Return the request body as a response
});

// Error handling middleware
app.use((err, _req, res) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(3001, () => console.log('Express server running on port 3001'));
