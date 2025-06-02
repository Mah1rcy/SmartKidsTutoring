require('dotenv').config(); // Load environment variables
const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function connectDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB for Tutor Applications and Student Progress!');
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    }
}
connectDB();

// Handle tutor application submission
app.post('/api/tutors', async (req, res) => {
    const tutorData = req.body;

    try {
        const db = client.db(process.env.DB_NAME);
        const tutorsCollection = db.collection('tutors'); // Collection name for tutor applications

        const result = await tutorsCollection.insertOne(tutorData);

        res.status(201).json({
            message: 'Tutor application submitted successfully!',
            insertedId: result.insertedId,
        });
    } catch (error) {
        console.error('MongoDB Error saving tutor application:', error);
        res.status(500).json({ message: 'Failed to save tutor application.' });
    }
});

// Handle student progress update
app.post('/api/progress', async (req, res) => {
    const { name, score } = req.body;

    if (!name || score == null) {
        return res.status(400).json({ message: 'Name and score are required.' });
    }

    try {
        const db = client.db(process.env.DB_NAME);
        const progressCollection = db.collection('student_progress');

        const progressEntry = {
            name,
            score,
            date: new Date()
        };

        const result = await progressCollection.insertOne(progressEntry);

        res.status(201).json({
            message: 'Student progress submitted successfully!',
            insertedId: result.insertedId,
        });
    } catch (error) {
        console.error('MongoDB Error saving student progress:', error);
        res.status(500).json({ message: 'Failed to save student progress.' });
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});
