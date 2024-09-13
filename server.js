import express from 'express';
import { check, validationResult } from 'express-validator';  // Import validators
import connectDatabase from './config/db.js';
import User from './models/Users.js';  // Import the User model

const app = express();
connectDatabase();

// Middleware to parse incoming JSON
app.use(express.json());

app.get('/', (_req, res) => 
    res.send('HTTP GET request sent to root API endpoint')
);

// Retrieve user by email
app.get('/api/users/:email', async (req, res) => {
    try {
        const { email } = req.params;

        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Respond with the user details
        res.status(200).json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create user route (using POST for creation)
app.post(
    '/api/users',
    [
        // Validation rules
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password must be at least 6 characters long').isLength({ min: 6 })
    ],
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });  // Use 422 for validation errors
        }

        try {
            const { name, email, password } = req.body;

            // Check if the user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'User with this email already exists' });
            }

            // Create a new user instance
            const newUser = new User({ name, email, password });

            // Save the new user to the database
            await newUser.save();

            // Respond with the created user (excluding the password)
            res.status(201).json({ name: newUser.name, email: newUser.email });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

// Update user route (using PUT for updates)
app.put(
    '/api/users/:email',
    [
        // Validation rules
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password must be at least 6 characters long').isLength({ min: 6 })
    ],
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });  // Use 422 for validation errors
        }

        try {
            const { email } = req.params;
            const { name, password } = req.body;

            // Find the user and update
            const updatedUser = await User.findOneAndUpdate(
                { email },
                { name, password },
                { new: true, runValidators: true }  // Return the updated document and run validation
            );

            if (!updatedUser) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Respond with the updated user details
            res.status(200).json(updatedUser);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

// Error handling middleware
app.use((err, _req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(3001, () => console.log('Express server running on port 3001'));
