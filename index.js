const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = 3000

app.use(cors())
app.use(express.json())

const uri = "mongodb+srv://book_haven_db:UDsLM2ooefnyhv7O@cluster0.5scl4km.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    const db = client.db('book_haven_db')
    const bookCollection = db.collection('Books')

    // Get all books
    app.get('/Books', async (req, res) => {
      try {
        const result = await bookCollection.find().toArray()
        res.send(result)
      } catch (error) {
        res.status(500).send({ message: "Failed to fetch books" })
      }
    })

    // post method
    //insertMany
    //insertOne

    app.post('/Books', (req, res) =>{
      const data = req.body
      console.log(data)
      // const result = bookCollection.insertOne('') 
      res.send({
        success: true
      })
    } )

    // Get book by ID
    app.get('/Books/:id', async (req, res) => {
      const { id } = req.params
      try {
        const book = await modelCollection.findOne({ _id: new ObjectId(id) })
        if (!book) {
          return res.status(404).send({ message: "Book not found" })
        }
        res.send(book)
      } catch (error) {
        res.status(500).send({ message: "Invalid book ID" })
      }
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// Test server
app.get('/', (req, res) => {
  res.send('Server is running')
})

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})
