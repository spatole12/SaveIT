const mongoCollections = require("../config/mongoCollections");
const goals = mongoCollections.goals;
const users1 = mongoCollections.users;
const users = require("./users");
const uuid = require("node-uuid");
const userId = "559a0ce7-b1a5-449c-8992-29af85ccbacc";

let exportedMethods = {
    async getAllgoals() {
        const goalCollection = await goals();
        return await goalCollection.find({}).toArray();
    },
    async getgoalsByTag(tag) {
        try {
            if (!tag) throw "No goal found";
            const goalCollection = await goals();
            const goal = await goalCollection.findOne({
                tag: tag
            });
            if (goal === null) throw "No goal found";
            return goal;
        } catch (e) {
            console.log(e);
        }

    },
    async getgoalById(id) {
        try {
            if (!id) throw "No goal found";
            const goalCollection = await goals();
            const goal = await goalCollection.findOne({
                _id: id
            });
            if (goal === null) throw "No goal found";
            return goal;
        } catch (e) {
            console.log(e);
        }

    },
    async getgoalByPriority(gpriority) {
        try {
            if (!gpriority) throw "No goal found";
            const goalCollection = await goals();
            const goal = await goalCollection.findOne({
                gpriority: gpriority
            });
            if (goal === null) throw "No goal found";
            return goal;
        } catch (e) {
            console.log(e);
        }

    },
    async addgoal(title, description, tags, userId, gamount, gstatus, gpriority1, percent, gtype) {
        const goalCollection = await goals();

        
		const userCollection = await users1();
		let misc_amount = await userCollection.find({"_id":userId},{"misc_amount":1}).toArray();
        let user_obj = await userCollection.findOne({"_id":userId});
        let per = user_obj;
        // console.log("===SP:per=="+JSON.stringify(per));
        let percent_amount = per["percent_amount"];
        console.log(per);
		let priority_n_amt = percent_amount["priority_n_amt"];
		let first_priority_amt = priority_n_amt["1"];
        let new_goal_amt = percent_amount["savings"] * percent/100; 
		if (new_goal_amt >  first_priority_amt)
		{
            console.log("SP:In if");
			gpriority = 1;
			let records = await goalCollection.find();
			records.forEach(function(doc)
			{
			let name = doc.gname;
			let priority = Number(doc.gpriority) + 1;
			goalCollection.updateOne({gname : name},{$set:{gpriority:priority}});
			});
			//update priorities in userCollection			
			if(new_goal_amt > misc_amount["misc_amount"])
			{

                console.log("in hieeeee");

				//reset all savings
				priority_n_amt[1] = new_goal_amt;
				gfulfilment = new_goal_amt;
				let amt_rem = percent_amount["savings"] - new_goal_amt;
				//distribute the rem amount into the rem priorities
				let users_records = userCollection.find();
				users_records.forEach(function(doc){
					let total_amt_otherprio = 0;
					let percent_amount1 = doc.percent_amount;
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
                    let misc_amt2 = Number(misc_amt1) +  Number(misc_amount["misc_amount"]);
                    console.log("=====misc_amt2======="+misc_amt2);
                    percent_amount1["priority_n_amt"] = priority_n_amt1 ;
				    userCollection.updateOne({"_id":userId},{$set:{percent_amount:percent_amount1,misc_amount:misc_amt2}});
					
					
					}
				});
				
			}
			else
			{
                console.log("========In yohooo=======");
				let misc_amt1 = Number(misc_amount["misc_amount"]) - Number(new_goal_amt);
				 userCollection.updateOne({"_id":userId},{$set:{misc_amount:misc_amt1}});
			}
		}
		else{
            console.log("======:):):)========")
			//assign next priority and assign gfulfilment the amount
			 const priority_string = await goalCollection.findOne({gpriority:gpriority1});
			if(priority_string === null)
			{   
			 gpriority = gpriority1;
			}
			else{
				gpriority = gpriority1;
				let records = await goalCollection.find();
				records.forEach(function(doc){
					let name = doc.gname;
					let priority = Number(doc.gpriority) + 1;
					goalCollection.updateOne({gname : name},{$set:{gpriority:priority}});
				});
			}
            gfulfilment = new_goal_amt;
            let misc_amt1 = Number(misc_amount["misc_amount"]) - Number(new_goal_amt);
            if(!(isNaN(misc_amt1)))
            {
            userCollection.updateOne({"_id":userId},{$set:{misc_amount:misc_amt1}});
            }
		}
        
        console.log("=======================================================");
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
            gpercent: percent,
            gcreatedOn: new Date(),
            gmodifiedBy: {
                id: userId,
                name: `${userThatgoaled.firstName} ${userThatgoaled.lastName}`
            },
            gmodifiedOn: new Date(),
            gstartDate: new Date(),
            pfulfilment: 0,
            gendDate: "",
            gtype: gtype,
            _id: uuid.v4()
        };
        const insertInfo = await goalCollection.insertOne(newgoal);
        if (insertInfo.insertedCount === 0) throw "Could not add post";

        return await this.getgoalById(insertInfo.insertedId);
    },
    async emergencyRemoval(amt_to_remove){
        const goalCollection = await goals();
        let goals_arr = await goalCollection.find({}).toArray();
		const userCollection = await users1();
        let users_arr_ = await userCollection.findOne({"_id":id});
        let users_arr = users_arr_;
        console.log("misc_amount"+users_arr["misc_amount"]);
		if(amt_to_remove < Number(users_arr["misc_amount"]))
		{
            console.log("In SP: if 1");
		let amt_rem = Number(users_arr["misc_amount"]) - Number(amt_to_remove) ; 
		await userCollection.updateOne({"_id":userId},{$set:{"misc_amount":amt_rem}});
		}
		else{
            console.log("In SP: if 2");
            let amt_rem = Number(amt_to_remove) - Number(users_arr["misc_amount"]) ;
            await userCollection.updateOne({"_id":userId},{$set:{"misc_amount":0}});
            let break_flag = 0;
                    
            for(let j = goals_arr.length+1; j>0; j--)
            {
                //goals_arr.forEach( function(goal_obj)
                console.log("goals_arr.length"+goals_arr.length)
                for(let i=0; i<goals_arr.length; i++)
                {
                    console.log("i===="+i);
                    let goal_obj = goals_arr[i];
                    let goal_priority = goal_obj["gpriority"];
                    console.log("goal_priority"+goal_priority);
                    if(goal_priority == j)
                    {       
                        //find with priority j
                        console.log("amt_rem"+amt_rem);
                        let amt_left_after_withrawal = goal_obj["gfulfilment"] - amt_rem;
                        if(amt_left_after_withrawal < 0)
                        {
                            console.log("====SP:<0=====");
                            await goalCollection.updateOne({"_id":goal_obj["_id"]},{$set:{gfulfilment:0}});
                            amt_rem = (-(amt_left_after_withrawal));
                        }
                        else if(amt_left_after_withrawal > 0)
                        {
                            console.log("====SP:>0=====");
                            await goalCollection.updateOne({"_id":goal_obj["_id"]},{$set:{gfulfilment:amt_left_after_withrawal}});
                            break_flag = 1;
                            break;
                        }
                        else if (amt_left_after_withrawal == 0)
                        {
                            console.log("====SP:=0=====");
                            await goalCollection.updateOne({"_id":goal_obj["_id"]},{$set:{gfulfilment:amt_left_after_withrawal}});
                            break_flag = 1;
                            break;
                        }
                    }
                };
                
                if(break_flag == 1)
                {
                    break;
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