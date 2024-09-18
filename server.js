import express from 'express';
import { check, validationResult } from 'express-validator';
import connectDatabase from './config/db.js';
import User from './models/Users.js';
import cors from 'cors';

const app = express();
connectDatabase();

app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));

app.get('/', (_req, res) => 
    res.send('HTTP GET request sent to root API endpoint')
);

app.get('/api/users/:email', async (req, res) => {
    try {
        const { email } = req.params;

        
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        
        res.status(200).json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post(
    '/api/users',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password must be at least 6 characters long').isLength({ min: 6 })
    ],
    async (req, res) => {
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() }); 
        }

        try {
            const { name, email, password } = req.body;

            
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'User with this email already exists' });
            }

            
            const newUser = new User({ name, email, password });


            await newUser.save();


            res.status(201).json({ name: newUser.name, email: newUser.email });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Server error' });
        }
    }
);


app.put(
    '/api/users/:email',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password must be at least 6 characters long').isLength({ min: 6 })
    ],
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() }); 
        }

        try {
            const { email } = req.params;
            const { name, password } = req.body;

        
            const updatedUser = await User.findOneAndUpdate(
                { email },
                { name, password },
                { new: true, runValidators: true }  
            );

            if (!updatedUser) {
                return res.status(404).json({ error: 'User not found' });
            }

            
            res.status(200).json(updatedUser);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Server error' });
        }
    }
);


app.use((err, _req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
const port = 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
