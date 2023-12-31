const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qw8qee2.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    const taskCollection = client.db('toDoListProject').collection("tasks");
    const userCollection = client.db('toDoListProject').collection("users");

    app.get('/tasks', async (req, res) => {
      const cursor = taskCollection.find()
      const result = await cursor.toArray();
      res.send(result)
    })

    //For single task data
    app.get('/tasks/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await taskCollection.findOne(query);
      res.send(result);
    })

    app.post('/tasks', async (req, res) => {
      const task = req.body;
      console.log('new task', task);
      const result = await taskCollection.insertOne(task);
      res.send(result);
    })

    app.delete('/tasks/:id', async (req, res) => {
      const id = req.params.id;
      console.log('please delete from database', id);
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.deleteOne(query)
      res.send(result);
    })

    app.put('/tasks/:id', async (req, res) => {
      const id = req.params.id;
      const updatedTask = req.body;
      console.log(id, updatedTask);
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const updatedUser = {
        $set: {
          title: updatedTask.title,
          date: updatedTask.date,
          status: updatedTask.status,
          description: updatedTask.description
        }
      }

      const result = await taskCollection.updateOne(filter, updatedUser, options);
      res.send(result);
    })

    //Post new user to the database
    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query);


      if (existingUser) {
        return res.send({ message: 'user already exists' })
      }

      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    //get all users
    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result)
    })

    //user get by email address
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const user = await userCollection.findOne(query);
      const result = { admin: user?.role === 'admin' }
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




app.get('/', (req, res) => {
  res.send(`Task sever is running`)
})

app.listen(port, () => {
  console.log(`Task server running on port, ${port}`);
})
