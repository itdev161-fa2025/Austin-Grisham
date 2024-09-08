import express from 'express';

const app = express();
const port = 3001;

app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the API',
        data: {
            info: 'This is the root API endpoint',
            version: '1.0.0'
        }
    })
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${3001}`);
});