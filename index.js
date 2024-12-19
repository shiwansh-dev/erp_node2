const express = require('express'); // Framework for handling HTTP requests
const mongoose = require('mongoose'); // MongoDB ODM
const bodyParser = require('body-parser'); // Middleware to parse JSON body
const { ObjectId } = require('mongodb'); // To handle ObjectId in MongoDB

// MongoDB connection string
const mongoURI = 'mongodb+srv://shiwanshaggarwal2004:YPvS4SDJwKc59iUv@cluster0.ueomq.mongodb.net/test2?retryWrites=true&w=majority';

// Connect to MongoDB
mongoose
    .connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('Failed to connect to MongoDB:', err.message);
        process.exit(1); // Exit the application if DB connection fails
    });

// Initialize Express app
const app = express();
app.use(bodyParser.json()); // Middleware to parse incoming JSON data

// Home route to display some text
app.get('/', (req, res) => {
    const htmlContent = `
        <html>
            <head>
                <title>Home Page</title>
            </head>
            <body>
                <h1>Welcome to the MongoDB Express Server!</h1>
                <p>This server allows you to perform CRUD operations on MongoDB collections.</p>
                <p>Use the following endpoints:</p>
                <ul>
                    <li><strong>POST /insert:</strong> Insert a document into a collection.</li>
                    <li><strong>GET /getAll:</strong> Retrieve all documents from a collection.</li>
                    <li><strong>PUT /edit:</strong> Update a document in a collection.</li>
                </ul>
            </body>
        </html>
    `;
    res.send(htmlContent);
});

// POST endpoint to insert a document
app.post('/insert', async (req, res) => {
    const { collectionName, document } = req.body;

    // Validate the request body
    if (!collectionName || !document) {
        return res.status(400).json({
            error: 'Both collectionName and document are required in the request body.',
        });
    }

    try {
        // Access the specified collection
        const collection = mongoose.connection.collection(collectionName);

        // Insert the document into the collection
        const result = await collection.insertOne(document);

        // Respond with success
        res.status(201).json({
            message: 'Document inserted successfully',
            insertedId: result.insertedId,
        });
    } catch (err) {
        console.error('Error inserting document:', err.message);
        res.status(500).json({
            error: 'Failed to insert document',
            details: err.message,
        });
    }
});

// GET endpoint to retrieve all documents from a collection
app.get('/getAll', async (req, res) => {
    const { collectionName } = req.query;

    if (!collectionName) {
        return res.status(400).json({
            error: 'collectionName is required in the query parameters.',
        });
    }

    try {
        const collection = mongoose.connection.collection(collectionName);
        const documents = await collection.find({}).toArray();
        res.status(200).json({
            message: 'Documents retrieved successfully',
            data: documents,
        });
    } catch (err) {
        res.status(500).json({
            error: 'Failed to retrieve documents',
            details: err.message,
        });
    }
});

// PUT endpoint to edit an existing document
app.put('/edit', async (req, res) => {
    const { collectionName, documentId, updates } = req.body;

    // Validate the request body
    if (!collectionName || !documentId || !updates) {
        return res.status(400).json({
            error: 'collectionName, documentId, and updates are required in the request body.',
        });
    }

    try {
        // Access the specified collection
        const collection = mongoose.connection.collection(collectionName);

        // Update the document by its _id
        const result = await collection.updateOne(
            { _id: new ObjectId(documentId) }, // Filter by document _id
            { $set: updates } // Apply the updates
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                error: 'No document found with the specified _id.',
            });
        }

        res.status(200).json({
            message: 'Document updated successfully',
            modifiedCount: result.modifiedCount,
        });
    } catch (err) {
        console.error('Error updating document:', err.message);
        res.status(500).json({
            error: 'Failed to update document',
            details: err.message,
        });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
