const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('ALrigt')
})

const uri = "mongodb+srv://waste:5BYJ75BDKCCSodDd@cluster0.duymm5q.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
const productCollection = client.db('waste').collection('products');

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection

        app.post('/products', async (req, res) => {
            const data = req.body;
            const result = await productCollection.insertOne(data);
            res.send(result);
        })
        app.get('/products', async (req, res) => {
            const result = await productCollection.find().toArray();
            res.send(result);
        })
        app.get('/product/:id', async (req, res) => {
            const { id } = req.params;
            const filter = { _id: new ObjectId(id) };
            const result = await productCollection.findOne(filter);
            res.send(result);
        })

        app.patch('/products/patch/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    ...data
                }
            };
            const options = { upsert: true };
            const result = await productCollection.updateOne(filter, updatedDoc, options);
            res.send(result)
        })

        app.delete('/products/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        })

        app.get("/search", async (req, res) => {
            try {
                const name = req.query.name; // search text

                if (!name) {
                    return res.status(400).json({ error: "Missing ?name= query" });
                }

                // Case-insensitive search using regex
                const results = await itemsCollection.find({
                    name: { $regex: name, $options: "i" }
                }).toArray();

                res.json(results);
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log('Is running');
})