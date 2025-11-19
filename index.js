const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config();

const app = express();


const allowedOrigins = [
  "https://the-book-haven-199.netlify.app",
  "http://localhost:5173",
  "http://localhost:5174"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS Blocked: Not allowed by server"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Middleware
app.use(express.json());

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.5scl4km.mongodb.net/?appName=Cluster0`;

// MongoDB client setup
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    const db = client.db('book_haven_db');
    const bookCollection = db.collection('Books');

    
    app.get('/Books', async (req, res) => {
      try {
        const result = await bookCollection.find().toArray();
        res.json(result);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch books" });
      }
    });


    app.get('/my-books/:email', async (req, res) => {
      try {
        const email = req.params.email;
        const result = await bookCollection.find({ userEmail: email }).toArray();
        res.json(result);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch user's books" });
      }
    });


    app.get('/Books/:id', async (req, res) => {
      const { id } = req.params;
      try {
        const book = await bookCollection.findOne({ _id: new ObjectId(id) });
        if (!book) return res.status(404).json({ message: "Book not found" });
        res.json(book);
      } catch (error) {
        res.status(500).json({ message: "Invalid book ID" });
      }
    });


    app.post('/Books', async (req, res) => {
      try {
        const data = req.body;
        const result = await bookCollection.insertOne(data);
        res.json({ success: true, message: "Book added successfully", insertedId: result.insertedId });
      } catch (error) {
        res.status(500).json({ success: false, message: "Failed to add book" });
      }
    });


    app.put('/Books/:id', async (req, res) => {
      const { id } = req.params;
      const updatedBook = { ...req.body };
      if (updatedBook._id) delete updatedBook._id;

      try {
        const result = await bookCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedBook }
        );
        if (result.matchedCount === 0) {
          return res.status(404).json({ success: false, message: "Book not found" });
        }
        res.json({ success: true, message: "Book updated successfully" });
      } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update book" });
      }
    });


    app.delete('/Books/:id', async (req, res) => {
      const { id } = req.params;
      try {
        const result = await bookCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount > 0) {
          res.json({ success: true, message: "Book deleted successfully" });
        } else {
          res.status(404).json({ success: false, message: "Book not found" });
        }
      } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete book" });
      }
    });

    // --------------------------------------
    // Root Route
    // --------------------------------------
    app.get('/', (req, res) => {
      res.send('📚 Book Haven Server is running!');
    });

    console.log("✅ Connected to MongoDB successfully!");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

// Run the async function
run();

// For Vercel deploy
module.exports = app;
