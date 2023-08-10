const { MongoClient } = require("mongodb");
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME;
console.log(DB_NAME)
let db;

module.exports = function (app) {
  MongoClient.connect("mongodb+srv://vedantpandey459:wkycehnH2RtEO8gU@linkup.7idliab.mongodb.net/", { useUnifiedTopology: true })
    .then((client) => {
      console.log("Connected to MongoDB Atlas");
      db = client.db("linkup");

      require("./routes")(db, app);
    })
    .catch((err) => {
      console.error(err);
    });
};
