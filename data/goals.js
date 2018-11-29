const mongoCollections = require("../config/mongoCollections");
const goals = mongoCollections.goals;
const users1 = mongoCollections.users;
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
    async addgoal(title, description, tags, userId, gamount, gstatus, gpriority1,percent) {
        const goalCollection = await goals();
        
		const userCollection = await users1();
		let misc_amount = await userCollection.find({"firstName":"Shivani"},{"misc_amount":1}).toArray();
       // let percent_amount_obj = await userCollection.find({"firstName":"Shivani"},{"percent_amount":1});
        let percent_amount_obj = await userCollection.find().toArray();
        //if(!percent_amount_obj){
        console.log("======SP:==========="+percent_amount_obj);
        //}   
        let per = percent_amount_obj[0];
        console.log("======SP:per========"+per);
        let percent_amount = per["percent_amount"];
        console.log("======SP:percent_amount========"+percent_amount);
		let priority_n_amt = percent_amount["priority_n_amt"];
		let first_priority_amt = priority_n_amt["1"];
        let new_goal_amt = percent_amount["savings"] * percent/100; 
        console.log("=====SP:new_goal_amt====="+new_goal_amt);
		if (new_goal_amt >  first_priority_amt)
		{
			//set as first priority_n_amt and set other's new priorities in goal collection
			
			gpriority = 1;
			let records = await goalCollection.find();
			records.forEach(function(doc)
			{
			console.log("doc.gprioritybefore==================================================="+doc.gpriority);
			// doc.gpriority2 == doc.gpriority+1;
			let name = doc.gname;
			let priority = Number(doc.gpriority) + 1;
			console.log("===kjsdfkj======"+priority);
			goalCollection.updateOne({gname : name},{$set:{gpriority:priority}});
			});
			//update priorities in userCollection			
			if(new_goal_amt > misc_amount["misc_amount"])
			{
				//reset all savings
				priority_n_amt[1] = new_goal_amt;
				gfulfilment = new_goal_amt;
				//await goalCollection.updateOne({"gpriority":1},{$set:{gfulfilment:new_goal_amt}});
				let amt_rem = misc_amount["misc_amount"] - new_goal_amt;
				//distribute the rem amount into the rem priorities
				let users_records = userCollection.find();
				users_records.forEach(function(doc){
					let total_amt_otherprio = 0;
					let percent_amount1 = doc.percent_amount;
					//let misc_amt1 = doc.misc_amount;
					let priority_n_amt1 = percent_amount["priority_n_amt"];
					let keys = Object.keys(priority_n_amt1);
					for (var i = 0; i< keys.length; i++) {
							
					if(keys[i] > 1)
					{
						let new_amount = (priority_n_amt1[keys[i]]/percent_amount1["savings"])* amt_rem;
						priority_n_amt1[keys[i]] = new_amount;
						total_amt_otherprio += new_amount;
					    goalCollection.updateOne({"gpriority":keys[i]},{$set:{gfulfilment:new_amount}});
					}	
                    let misc_amt1 = amt_rem - total_amt_otherprio;
                    percent_amount1["priority_n_amt"] = priority_n_amt1 ;
				    userCollection.updateOne({"firstName":"Shivani Patole"},{$set:{percent_amount:percent_amount1,misc_amount:misc_amt1}});
					
					
					}
				});
				
			}
			else
			{
				let misc_amt1 = misc_amount["misc_amount"] - new_goal_amt;
				 userCollection.updateOne({"firstName":"Shivani Patole"},{$set:{misc_amount:misc_amt1}});
			}
		}
		else{
			//assign next priority and assign gfulfilment the amount
			 const priority_string = await goalCollection.findOne({gpriority:gpriority1});
			console.log("priority=================================================");
			if(priority_string === null)
			{   
			console.log("in if========");
			 gpriority = gpriority1;
			}
			else{
				console.log("in else========");
				gpriority = gpriority1;
				let records = await goalCollection.find();
				records.forEach(function(doc){
					console.log("doc.gprioritybefore==================================================="+doc.gpriority);
					// doc.gpriority2 == doc.gpriority+1;
				   
					let name = doc.gname;
					let priority = Number(doc.gpriority) + 1;
					console.log("===kjsdfkj======"+priority);
					goalCollection.updateOne({gname : name},{$set:{gpriority:priority}});
					console.log("doc.gpriorityafter==================================================="+doc.gpriority);
				});
			}
			//gpriority = gpriority1;
			gfulfilment = new_goal_amt;
		}
        
        //let percent_fulfilment = (gfulfilment/gamount)*100;
        const userThatgoaled = await users.getUserById(userId);
        let newgoal = {
            gname: title,
            gdescription: description,
            gcreatedBy: {
                id: userId,
                name: `${userThatgoaled.firstName} ${userThatgoaled.lastName}`
            },
            gtags: tags,
            gamount: gamount,
            gstatus: gstatus,
            gfulfilment: 0,
            gpriority: gpriority,
            gpercent : percent,
            gcreatedOn: new Date(),
            gmodifiedBy: {
                id: userId,
                name: `${userThatgoaled.firstName} ${userThatgoaled.lastName}`
            },
            gmodifiedOn: new Date(),
            gstartDate: new Date(),
            pfulfilment : 0,
            gendDate: "",
            _id: uuid.v4()
        };
        const insertInfo = await goalCollection.insertOne(newgoal);
        if (insertInfo.insertedCount === 0) throw "Could not add post";

        return await this.getgoalById(insertInfo.insertedId);
    },
     async emergencyRemoval(amt_to_remove){
        const goalCollection = await goals();
        let goals_arr = await goalCollection.find({}).toArray();
        for(let j = goals_arr.length; j>0; j--)
        {
            console.log("====SP:j====="+j);
            for(let i=0 ;i<= goals_arr.length; i++)
            {
                let goal_obj = goals_arr[i];
                console.log("========SP:goal_obj======="+goal_obj);
                let goal_priority = goal_obj["gpriority"];
                if(goal_priority == j)
                 {       
                    //find with priority j
                    //let goal_obj = goals_arr[j];
                    let amt_left_after_withrawal = goal_obj["gfulfilment"] - amt_to_remove;
                    if(amt_left_after_withrawal < 0)
                    {
                        console.log("====SP:<0=====");
                        await goalCollection.updateOne({"_id":goal_obj["_id"]},{$set:{gfulfilment:0}});
                        amt_to_remove = (-(amt_left_after_withrawal));
                        continue;
                    }
                    else if(amt_left_after_withrawal > 0)
                    {
                        console.log("====SP:>0=====");
                        await goalCollection.updateOne({"_id":goal_obj["_id"]},{$set:{gfulfilment:amt_left_after_withrawal}});
                        break;
                    }
                    else if (amt_left_after_withrawal == 0)
                    {
                        console.log("====SP:=0=====");
                        await goalCollection.updateOne({"_id":goal_obj["_id"]},{$set:{gfulfilment:amt_left_after_withrawal}});
                        break;
                    }
                }
             }
                        
        }
        return 1;
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