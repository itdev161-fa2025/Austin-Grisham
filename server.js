import express from 'express';
import connectDatabase from './config/db.js';
import { connect } from 'mongoose';

const app = express();
connectDatabase();

app.get('/', (req, res) => 
    res.send('http get request sent to root api endpoint')
);
app.listen(3001, () => console.log('Express server running on port 3001'))
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
