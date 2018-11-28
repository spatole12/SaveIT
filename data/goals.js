const mongoCollections = require("../config/mongoCollections");
const goals = mongoCollections.goals;
const users = require("./users");
const uuid = require("node-uuid");

let exportedMethods = {
    async getAllgoals() {
        const goalCollection = await goals();
        return await goalCollection.find({}).toArray();
    },
    async getgoalsByTag(tag) {
        if (!tag) throw "No goal found";
        const goalCollection = await goals();
        const goal = await goalCollection.findOne({
            tag: tag
        });
        if (goal === null) throw "No goal found";
        return goal;
    },
    async getgoalById(id) {
        if (!id) throw "No goal found";
        const goalCollection = await goals();
        const goal = await goalCollection.findOne({
            _id: id
        });
        if (goal === null) throw "No goal found";
        return goal;
    },
    async getgoalByPriority(gpriority) {
        if (!gpriority) throw "No goal found";
        const goalCollection = await goals();
        const goal = await goalCollection.findOne({
            gpriority: gpriority
        });
        if (goal === null) throw "No goal found";
        return goal;
    },
    async addgoal(title, body, tags, userId, gamount, gstatus, gpriority) {
        const goalCollection = await goals();
        const userThatgoaled = await users.getUserById(userId);
        let newgoal = {
            gname: title,
            gdescription: body,
            gcreatedBy: {
                id: userId,
                name: `${userThatgoaled.firstName} ${userThatgoaled.lastName}`
            },
            gtags: tags,
            gamount: gamount,
            gstatus: gstatus,
            gfulfilment: 0,
            gpriority: gpriority,
            gcreatedOn: new Date(),
            gmodifiedBy: {
                id: userId,
                name: `${userThatgoaled.firstName} ${userThatgoaled.lastName}`
            },
            gmodifiedOn: new Date(),
            gstartDate: new Date(),
            gendDate: "",
            _id: uuid.v4()
        };
        const insertInfo = await goalCollection.insertOne(newgoal);
        if (insertInfo.insertedCount === 0) throw "Could not add post";

        return await this.getgoalById(insertInfo.insertedId);
    },
    removegoal(id) {
        return goals().then(goalCollection => {
            return goalCollection.removeOne({
                _id: id
            }).then(deletionInfo => {
                if (deletionInfo.deletedCount === 0) {
                    throw `Could not delete goal with id of ${id}`;
                } else {}
            });
        });
    },
    updategoal(id, updatedgoal) {
        return goals().then(goalCollection => {
            let updatedgoalData = {};
            var l_objGoal = this.getgoalById(id);
            if (updatedgoal.tags) {
                updatedgoalData.tags = updatedgoal.tags;
            }

            if (updatedgoal.title) {
                updatedgoalData.name = updatedgoal.title;
            }

            if (updatedgoal.gamount) {
                updatedgoalData.gamount = updatedgoal.gamount;
            } else {
                updatedgoalData.gamount = l_objGoal.gamount;
            }
            if (updatedgoal.gfulfilment) {
                updatedgoalData.gfulfilment = l_objGoal.gfulfilment;
                updatedgoalData.gfulfilment = updatedgoalData.gdescription + updatedgoal.gfulfilment;
            }
            if (updatedgoal.gpriority) {
                updatedgoalData.gpriority = updatedgoal.gpriority;
            }
            updatedgoalData.gmodifiedOn = new Date();
            if (updatedgoalData.gfulfilment > updatedgoalData.gamount) {
                var l_numCarryOver = updatedgoalData.gfulfilment - updatedgoalData.gamount;
                updatedgoalData.gstatus = 1;
                updatedgoalData.gendDate = new Date();
                var l_objCarryOver = this.getgoalByPriority(l_objGoal.gpriority++);
                this.updategoal(l_objCarryOver._id, {
                    "gfulfilment": l_numCarryOver
                });
            }

            let updateCommand = {
                $set: updatedgoalData
            };

            return goalCollection
                .updateOne({
                    _id: id
                }, updateCommand)
                .then(result => {
                    return this.getgoalById(id);
                });
        });
    },
    renameTag(oldTag, newTag) {
        let findDocuments = {
            tags: oldTag
        };

        let firstUpdate = {
            $pull: oldTag
        };

        let secondUpdate = {
            $addToSet: newTag
        };

        return goalCollection
            .updateMany(findDocuments, firstUpdate)
            .then(result => {
                return goalCollection.updateMany(findDocuments, secondUpdate);
            })
            .then(secondUpdate => {
                return this.getgoalsByTag(newTag);
            });
    }
};

module.exports = exportedMethods;