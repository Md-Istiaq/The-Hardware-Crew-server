const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion ,ObjectId } = require('mongodb');
const port = process.env.PORT || 5000
const app = express()

app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4utyu.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const partsCollection = client.db('assignment12').collection('parts')
        const ordersCollection = client.db('assignment12').collection('orders')

        app.get('/parts' , async(req,res) =>{
            const query = {}
            const cursour =  partsCollection.find(query)
            const parts = await cursour.toArray()
            res.send(parts)
        })
        app.get('/parts/:id' , async(req,res) =>{
            const id = req.params.id
            const query = {_id:ObjectId(id)}
            const part = await partsCollection.findOne(query)
            res.send(part)
        })

        app.post('/orders' , async(req,res) =>{
            const newOrder = req.body;
            const result = await ordersCollection.insertOne(newOrder)
            res.send(result)
        })


    }
    finally{

    }
}
run().catch(console.dir)

app.get('/' , (req,res) =>{
    res.send("Running assignment12 server")
})

app.listen(port, () =>{
    console.log("Listening to port",port)
})
