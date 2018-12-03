const mongoCollections = require("../config/mongoCollections");
const goals = mongoCollections.goals;
const users1 = mongoCollections.users;
const metadata = mongoCollections.metadata;
const users = require("./users");
const uuid = require("node-uuid");


let exportedMethods = {
    async getAllTransactions() {
        const metaCollection = await metadata();
        return await metaCollection.find({}).toArray();
    },

    async addTransaction(amount) {
        const metaCollection = await metadata();

        let newtransaction = {
            tamount: Number(amount),
            tAddedOn: new Date(),
            _id: uuid.v4()
        };
        const insertInfo = await metaCollection.insertOne(newtransaction);
        if (insertInfo.insertedCount === 0) throw "Could not add post";
        return true;
       
    },

};

module.exports = exportedMethods;