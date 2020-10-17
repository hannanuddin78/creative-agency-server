const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs-extra");
const fileUpload = require("express-fileupload");
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.ugsfy.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static("orderImg"));
app.use(fileUpload());
const { ObjectID } = require("mongodb");

const port = 5000;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const orderCollection = client.db("creativeAgency").collection("orders");
  const reviewCollection = client.db("creativeAgency").collection("reviews");
  const serviceCollection = client.db("creativeAgency").collection("service");
  const adminEmailCT = client.db("creativeAgency").collection("adminEmail");
  console.log("ok");
  app.post("/addOrder", (req, res) => {
    const fileds = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const project = req.body.project;
    const projectDetails = req.body.projectDetails;
    const price = req.body.price;

    const newImg = fileds.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(encImg, "base64"),
    };

    orderCollection
      .insertOne({ name, email, project, projectDetails, price, image })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });

  app.get("/seeOrder", (req, res) => {
    orderCollection
      .find({ email: req.query.email })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  app.get("/orderSeeAdmin", (req, res) => {
    orderCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/addReview", (req, res) => {
    const review = req.body;
    reviewCollection.insertOne(review).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/seeReview", (req, res) => {
    reviewCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/addService", (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const designation = req.body.designation;
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(encImg, "base64"),
    };

    serviceCollection
      .insertOne({ title, designation, image })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });

  app.get("/seeService", (req, res) => {
    serviceCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/check-admin", (req, res) => {
    const email = req.body.email;
    adminEmailCT.find({ email: email }).toArray((err, doc) => {
      if (doc.length === 0) {
        res.send({ admin: false });
      } else {
        res.send({ admin: true });
      }
    });
  });

  app.post("/addAdmin", (req, res) => {
    const admin = req.body;
    adminEmailCT.insertOne(admin).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.patch("/update-status", (req, res) => {
    orderCollection
      .updateOne(
        { _id: ObjectID(req.body.id) },
        {
          $set: { status: req.body.status },
        }
      )
      .then((result) => {
        res.send(result.modifiedCount > 0);
      })
      .catch((err) => console.log(err));
  });
});

app.get("/", (req, res) => {
  res.send("hanan paku");
});

app.listen(process.env.PORT || port);
