const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;
const goals = mongoCollections.goals;
const uuid = require("node-uuid");

let exportedMethods = {
  getAllUsers() {
    return users().then(userCollection => {
      return userCollection.find({}).toArray();
    });
  },
  // This is a fun new syntax that was brought forth in ES6, where we can define
  // methods on an object with this shorthand!
  getUserById(id) {
    return users().then(userCollection => {
      return userCollection.findOne({ _id: id }).then(user => {
        if (!user) throw "User not found";

        return user;
      });
    });
  },
  addUser(firstName, lastName) {
    console.log(firstName + lastName);
    return users().then(userCollection => {
      let newUser = {
        firstName: firstName,
        lastName: lastName,
        _id: uuid.v4(),
        goals: [],
        misc_amount: 0,
        percent_amount: {
          priority_n_amt: {},
          amt1: 0,
          savings: 0
        }
      };

      return userCollection
        .insertOne(newUser)
        .then(newInsertInformation => {
          return newInsertInformation.insertedId;
        })
        .then(newId => {
          return this.getUserById(newId);
        });
    });
  },
  removeUser(id) {
    return users().then(userCollection => {
      return userCollection.removeOne({ _id: id }).then(deletionInfo => {
        if (deletionInfo.deletedCount === 0) {
          throw `Could not delete user with id of ${id}`;
        }
      });
    });
  },
  updateUser(id, updatedUser) {
    return this.getUserById(id).then(currentUser => {
      let updatedUser = {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName
      };

      let updateCommand = {
        $set: updatedUser
      };

      return userCollection.updateOne({ _id: id }, updateCommand).then(() => {
        return this.getUserById(id);
      });
    });
  },
  addgoalToUser(userId, goalId, goalTitle) {
    return this.getUserById(id).then(currentUser => {
      return userCollection.updateOne(
        { _id: id },
        {
          $addToSet: {
            goals: {
              id: goalId,
              title: goalTitle
            }
          }
        }
      );
    });
  },
  removegoalFromUser(userId, goalId) {
    return this.getUserById(id).then(currentUser => {
      return userCollection.updateOne(
        { _id: id },
        {
          $pull: {
            goals: {
              id: goalId
            }
          }
        }
      );
    });
  },
  async addSavingsToGoals(savings) {
    console.log("===SP:In addSavings===");
    let amt1 = 0;
    console.log("====SP:In distributeSavings=======");

    //console.log("======"+typeof(saving_obj));
    let goalCollection = await goals();
    //let amt_asper_percent = {};
    let percent_allocation1 = await goalCollection.find({}).toArray();
    /* if(new_priority < priority_1) */
    //for(i=0; i < percent_allocation.length; i++)
    console.log("percent_allocation1" + percent_allocation1);
    let priority_obj = {};
    let saving_obj = {};
    for (let i = 0; i < percent_allocation1.length; i++) {
      let userCollection = await users();
      let percent_allocation = percent_allocation1[i];
      let id = percent_allocation["_id"];
      let gpriority = percent_allocation["gpriority"];
      console.log("======SP:priority=====" + gpriority.toString());
      let amount = percent_allocation["gpercent"] * savings / 100;
      console.log(amount);
      priority_obj[gpriority] = amount;
      console.log("====prioityobj" + JSON.stringify(priority_obj));
      //amt1 = total amt used from savings
      amt1 += amount;
      console.log(amt1);
      let updated_amt = amount + percent_allocation["gfulfilment"];
      /* if(updated_amt <= percent_allocation["gfulfilment"])
      { */
      goalCollection.updateOne({ "_id": id }, { $set: { gfulfilment: updated_amt } });
      let pf = (updated_amt/percent_allocation["gamount"])*100;
      goalCollection.updateOne({ "_id": id }, { $set: { gfulfilment: updated_amt,pfulfilment:pf } });

      /*  }
       else{
         let amount_req_to_fulfill = percent_allocation["gamount"] - percent_allocation["gfulfilment"];
         let new_updated_amt = percent_allocation["gfulfilment"] + amount_req_to_fulfill ;
         goalCollection.updateOne({"_id":id},{$set:{gfulfilment:new_updated_amt}});

         let excess_amt = updated_amt-amount_req_to_fulfill;
         let misc_amount1 = percent_allocation["misc_amount"] + excess_amt;
         userCollection.updateOne({"firstName":"Shivani"},{$set:{"misc_amount" : misc_amount1}});
       } */
      saving_obj = {
        "amt1": amt1,
        "savings": savings,
        "priority_n_amt": priority_obj
      };
      console.log("Saving Obj " + JSON.stringify(saving_obj));
      // let userCollection =  await users();
      // userCollection.updateOne({"firstName":"Shivani"},{$set:{misc_amount : 8}});
      userCollection.updateOne({ "firstName": "Shivani" }, { $set: { "percent_amount": saving_obj } });
      console.log("Done!!!");

      let distribute_savings_arr = await userCollection.find({}).toArray();
      let arr_obj = distribute_savings_arr[0];
      console.log("arr obj" + JSON.stringify(arr_obj));
      let percent_amount_assign = arr_obj["percent_amount"];
      let new_misc_amt = percent_amount_assign["savings"] - percent_amount_assign["amt1"];
      console.log("lalala" + arr_obj["misc_amount"]);
      console.log(new_misc_amt);
      let misc = arr_obj["misc_amount"];
      console.log("misc======" + misc);
      let misc_amount2 = misc + new_misc_amt;
      console.log("miscamt" + misc_amount2);
      //let userCollection =  await users();
      userCollection.updateOne({ "firstName": "Shivani" }, { $set: { "misc_amount": misc_amount2 } });
      console.log("===SP:aft distri===");

    }
    this.computeProgress();
    return 1;
  },
  async computeProgress() {
    console.log("Yohoooooo!!");
    const goalCollection = await goals();
    let goals_arr = await goalCollection.find({}).toArray();
    for (let j = 0; j < goals_arr.length; j) {
      let goal_obj = goals_arr[j];
      let goal_id = goal_obj["_id"];
      console.log(goal_obj["gfulfilment"]);
      console.log(goal_obj["gamount"]);
      let pfulfilment1 = (goal_obj["gfulfilment"] / goal_obj["gamount"]) * 100;
      await goalCollection.updateOne({ "_id": goal_id }, { $set: { pfulfilment: pfulfilment1 } });

    }
  },

};

module.exports = exportedMethods;
