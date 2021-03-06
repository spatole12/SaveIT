const dbConnection = require("./mongoConnection");
try{
/* This will allow you to have one reference to each collection per app */
/* Feel free to copy and paste this this */
const getCollectionFn = collection => {
  let _col = undefined;
  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }
   return _col;
  };
};

/* Now, you can list your collections here: */
module.exports = {
  goals: getCollectionFn("goals"),
  users: getCollectionFn("users"),
  metadata:getCollectionFn("metadata")
};

}
catch(e){
  throw `Problem in Collection`;
}