const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI
const uri = "mongodb+srv://book_haven_db:UDsLM2ooefnyhv7O@cluster0.5scl4km.mongodb.net/?appName=Cluster0";

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
    await client.connect();
    const db = client.db('book_haven_db');
    const bookCollection = db.collection('Books');

    // ✅ Get all books
    app.get('/Books', async (req, res) => {
      try {
        const result = await bookCollection.find().toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to fetch books" });
      }
    });

    // ✅ Get books by user email (for MyBooks page)
    app.get('/my-books/:email', async (req, res) => {
      try {
        const email = req.params.email;
        const result = await bookCollection.find({ userEmail: email }).toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to fetch user's books" });
      }
    });

    // ✅ Get a single book by ID
    app.get('/Books/:id', async (req, res) => {
      const { id } = req.params;
      try {
        const book = await bookCollection.findOne({ _id: new ObjectId(id) });
        if (!book) return res.status(404).send({ message: "Book not found" });
        res.send(book);
      } catch (error) {
        res.status(500).send({ message: "Invalid book ID" });
      }
    });

    // ✅ Add a new book
    app.post('/Books', async (req, res) => {
      try {
        const data = req.body; // { title, author, genre, rating, summary, coverImage, userEmail }
        const result = await bookCollection.insertOne(data);
        res.send({
          success: true,
          message: "Book added successfully",
          insertedId: result.insertedId,
        });
      } catch (error) {
        res.status(500).send({ success: false, message: "Failed to add book" });
      }
    });

    // ✅ Update a book by ID (safe version)
    app.put('/Books/:id', async (req, res) => {
      const { id } = req.params;
      const updatedBook = { ...req.body }; // expect {title, author, genre, rating, summary, coverImage}

      // Remove _id if present in body to prevent MongoDB errors
      if (updatedBook._id) delete updatedBook._id;

      try {
        const result = await bookCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedBook }
        );

        if (result.matchedCount === 0) {
          return res.status(404).send({ success: false, message: "Book not found" });
        }

        res.send({ success: true, message: "Book updated successfully" });
      } catch (error) {
        console.error("Update error:", error); // ✅ log actual error
        res.status(500).send({ success: false, message: "Failed to update book" });
      }
    });

    // ✅ Delete a book by ID
    app.delete('/Books/:id', async (req, res) => {
      const { id } = req.params;
      try {
        const result = await bookCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount > 0) {
          res.send({ success: true, message: "Book deleted successfully" });
        } else {
          res.status(404).send({ success: false, message: "Book not found" });
        }
      } catch (error) {
        res.status(500).send({ success: false, message: "Failed to delete book" });
      }
    });

    // ✅ Confirm MongoDB Connection
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Connected to MongoDB successfully!");
  } finally {
    // Keep connection open
  }
}

run().catch(console.dir);

// ✅ Default route
app.get('/', (req, res) => {
  res.send('📚 Book Haven Server is running!');
});

// ✅ Start the server
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
