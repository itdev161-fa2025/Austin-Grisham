import mongoose from 'mongoose';
import config from 'config';

const db = config.get('mongodbUri');

const connectDatabase = async () => {
    try {
        await mongoose.connect(db, {
            // Remove useNewUrlParser and useUnifiedTopology as they are deprecated
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

export default connectDatabase;
