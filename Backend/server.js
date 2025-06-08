// ✅ Check if the student already submitted a test
app.get('/api/test-status', async (req, res) => {
    const { student_id, test_id } = req.query;

    try {
        const db = client.db(process.env.DB_NAME);
        const submissions = db.collection('test_submissions');

        const record = await submissions.findOne({ student_id, test_id });

        res.json({ alreadyTaken: !!record }); // true if found, false if not
    } catch (error) {
        console.error('Error checking test status:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// ✅ Submit test if not already submitted
app.post('/api/submit-test', async (req, res) => {
    const { student_id, test_id, answers } = req.body;

    try {
        const db = client.db(process.env.DB_NAME);
        const submissions = db.collection('test_submissions');

        const exists = await submissions.findOne({ student_id, test_id });
        if (exists) {
            return res.status(403).json({ message: 'You already submitted this test.' });
        }

        await submissions.insertOne({
            student_id,
            test_id,
            answers,
            submitted_at: new Date()
        });

        res.status(201).json({ message: 'Test submitted successfully!' });
    } catch (error) {
        console.error('Error submitting test:', error);
        res.status(500).json({ message: 'Failed to submit test.' });
    }
});
