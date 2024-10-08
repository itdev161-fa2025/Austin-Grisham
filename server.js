import express from 'express';
import { check, validationResult } from 'express-validator';
import connectDatabase from './config/db.js';
import User from './models/User.js';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';  // Importing jsonwebtoken
import config from 'config';  // Importing config

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
            // Destructure name, email, and password from the request body
            const { name, email, password } = req.body;

            // Check if the user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'User with this email already exists' });
            }

            // Encrypt the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create a new user
            const newUser = new User({ name, email, password: hashedPassword });

            // Save the user to the database
            await newUser.save();

            // JWT implementation: Create a payload and generate the token
            const payload = {
                user: {
                    id: newUser.id  // Using the user's id
                }
            };

            // Generate a token with the secret "gopackgo" and set expiration to 1 hour
            jwt.sign(
                payload,
                "gopackgo",  // Secret key
                { expiresIn: 3600 },  // Token expiration time (1 hour)
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });  // Return the token as a JSON object
                }
            );

        } catch (err) {
            // Return an error in case of any issues
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
