const express = require('express')
const cors = require('cors')
require('dotenv').config()
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion ,ObjectId } = require('mongodb');
const port = process.env.PORT || 5000
const app = express()

app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4utyu.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT( req,res,next){
    const authHeader = req.headers.authorization
    if(!authHeader){
      return res.status(401).send({massage:'Unauthorized access'})
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token,process.env.DB_TOKEN , function(err , decoded){
      if(err){
        return res.status(403).send({massage:"forbidden access"})
      }
      req.decoded = decoded
      next()
    })
  }

async function run(){
    try{
        await client.connect();
        const partsCollection = client.db('assignment12').collection('parts')
        const ordersCollection = client.db('assignment12').collection('orders')
        const reviewCollection = client.db('assignment12').collection('review')
        const usersCollection = client.db('assignment12').collection('users')

        app.get('/parts' , async(req,res) =>{
            const query = {}
            const cursour =  partsCollection.find(query)
            const parts = await cursour.toArray()
            res.send(parts)
        })

        app.post('/parts' , async(req,res) =>{
            const newParts = req.body;
            const result = await partsCollection.insertOne(newParts)
            res.send(result)
        })

        app.delete('/parts/:id' , async(req,res) =>{
            const id = req.params.id
            const query = {_id:ObjectId(id)}
            const result = await partsCollection.deleteOne(query)
            res.send(result)
        })
        app.get('/review' , async(req,res) =>{
            const query = {}
            const cursour =  reviewCollection.find(query)
            const reviews = await cursour.toArray()
            res.send(reviews)
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
        app.post('/review' , async(req,res) =>{
            const newReview = req.body;
            const result = await reviewCollection.insertOne(newReview)
            res.send(result)
        })

        app.get('/orders/:email', async(req,res) =>{
            const email = req.params.email
                const query = {email:email}
                const cursor = ordersCollection.find(query)
                const items = await cursor.toArray()
                res.send(items)
        })

        app.put('/user/:email' , async(req,res) =>{
            const email = req.params.email;
            const user = req.body
            const filter = {email:email}
            const options = {upsert:true}
            const updatedDoc = {

              $set:user
            }
            const result = await usersCollection.updateOne(filter , updatedDoc,options)
            const token = jwt.sign({email:email} , process.env.ACCESS_TOKEN , {expiresIn:'1h'})
            res.send({result ,token})
          })

          app.get('/user' , async(req,res) =>{
            const users = await usersCollection.find().toArray()
            res.send(users)
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
