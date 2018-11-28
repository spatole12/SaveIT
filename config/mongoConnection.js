const MongoClient = require("mongodb").MongoClient;
try{
const settings = {
  mongoConfig: {
    serverUrl: "mongodb://localhost:27017/",
    database: "SaveIT"
  }
};

let fullMongoUrl =
  settings.mongoConfig.serverUrl + settings.mongoConfig.database;
let _connection = undefined;

let connectDb = async () => {
  if (!_connection) {
    // _connection = MongoClient.connect(fullMongoUrl).then(db => {
      // return db;
      
    // });

    _connection = await MongoClient.connect(settings.mongoConfig.serverUrl,{ useNewUrlParser: true } );
    _db = await _connection.db(settings.mongoConfig.database);
  }

  return _db;
  // return _connection;
};

module.exports = connectDb;
}

catch(e){
  throw `Problem in connection`;
}