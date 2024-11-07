import express from 'express';
import { check, validationResult } from 'express-validator';
import connectDatabase from './config/db.js';
import User from './models/User.js';
import Post from './models/Post.js';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from 'config';
import auth from './middleware/auth.js';

const app = express();
connectDatabase();

app.use(express.json());
app.use(cors({ origin: 'http://localhost:3001' }));

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

const returnToken = (user, res) => {
    const payload = {
        user: {
            id: user.id
        }
    };

    jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: '10hr' },
        (err, token) => {
            if (err) throw err;
            res.json({ token });
        }
    );
};

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

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = new User({ name, email, password: hashedPassword });
            await newUser.save();

            returnToken(newUser, res);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

app.post(
    '/api/login',
    [
        check('email', 'Please enter a valid email').isEmail(),
        check('password', 'A password is required').exists(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ errors: [{ msg: 'Invalid email or password' }] });
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return res.status(400).json({ errors: [{ msg: 'Invalid email or password' }] });
            }

            returnToken(user, res);
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

app.get('/api/auth', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).send('Unknown server error');
    }
});

app.post(
    '/api/posts',
    auth,
    [
        check('title', 'Title text is required').not().isEmpty(),
        check('body', 'Body text is required').not().isEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, body } = req.body;
        try {
            const user = await User.findById(req.user.id);

            const post = new Post({
                user: user.id,
                title: title,
                body: body
            });

            await post.save();
            res.json(post);
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }
    }
);

app.use((err, _req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const port = 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
