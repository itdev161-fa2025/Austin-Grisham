import jwt from 'jsonwebtoken';
import config from 'config';

const auth = (req, res, next) => {
    // Retrieve the token from the headers
    const token = req.header('x-auth-token');
    const secret = config.get('jwtSecret');

    // Log to check if the token is being received
    console.log('Token received:', token);

    if (!token) {
        console.log('No token provided. Authorization denied.'); // Log missing token
        return res
            .status(401)
            .json({ message: 'Missing authentication token. Authorization failed.' });
    }

    try {
        // Verify and decode the token
        const decodedToken = jwt.verify(token, secret);
        console.log('Decoded token:', decodedToken); // Log decoded token for verification

        // Attach the user information to req.user
        req.user = decodedToken.user;
        console.log('User ID from token:', req.user.id); // Confirm user ID is set on req.user

        next();
    } catch (error) {
        console.log('Token verification failed:', error.message); // Log verification failure details
        res
            .status(401)
            .json({ message: 'Invalid authentication token. Authorization failed.' });
    }
};

export default auth;
