const express = require('express');
const app = express()
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;
// middleware
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('task manegement server is running');
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ndxdp2s.mongodb.net/?retryWrites=true&w=majority`;


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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const taskCollection = client.db("Task-Management").collection("task");

    app.get("/task", async (req, res) => {
      const cursor = taskCollection.find();
      const result = await cursor.toArray()
      res.send(result)
    })

    app.get("/updateTask/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.findOne(query);
      res.send(result);
    });

    app.post("/post-task", async (req, res) => {
      const body = req.body;
      console.log(body);
      const result = await taskCollection.insertOne(body);
      res.send(result);
    });

    // update task
    app.patch("/taskUpdate/:id", async (req, res) => {
      const id = req.params.id;
      const updateTask = req.body;
      console.log(updateTask);

      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };

      const updateDoc = {
        $set: {
          status: updateTask.status

        },
      };
      const result = await taskCollection.updateOne(filter, updateDoc, option);
      res.send(result);
    });
    app.delete('/taskDelete/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.deleteOne(query);
      res.send(result);
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



app.listen(port, () => {
  console.log(`server is running on port ${port}`);
})