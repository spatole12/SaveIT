const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;
const goals = mongoCollections.goals;
const uuid = require("node-uuid");
const userId = "18293ea2-1a06-4c55-8fb3-4e1acf0ba484";

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
    let amount = 0;
    let first_prior_amt = 0;
    let goalCollection = await goals();
    let percent_allocation1 = await goalCollection.find({}).toArray();
    let priority_obj = {};
    let saving_obj = {};
      percent_allocation1.forEach(async function(percent_allocation){
      let userCollection = await users();
      let id = percent_allocation["_id"];
      let gpriority = percent_allocation["gpriority"];
      console.log("====gpriority==="+gpriority);
      if(gpriority == 1)
      {
       amount = percent_allocation["gpercent"] * savings / 100;
      first_prior_amt = amount;
      //priority_obj[gpriority] = amount;
      //amt1 += amount;
      }
      else{
        console.log("Inprioriry >1");
       let rem_amt5 = savings - first_prior_amt;
       console.log("rem_amt5"+rem_amt5);
       amount = percent_allocation["gpercent"] * rem_amt5 / 100;
       console.log("amount  "+amount);
      // priority_obj[gpriority] = amount;
      // amt1 += amount;
      }
      
      let updated_amt = amount + percent_allocation["gfulfilment"];
	  
	  
	  
	   if(percent_allocation["gfulfilment"] == 0 )
      {
        console.log("In if 1");
      let pf = (updated_amt/percent_allocation["gamount"])*100;
      goalCollection.updateOne({ "_id": id }, { $set: { gfulfilment: updated_amt,pfulfilment:pf }});
      priority_obj[gpriority] = updated_amt;
      amt1 += Number(updated_amt);
      }
      else if(updated_amt <= percent_allocation["gamount"])
      {
        console.log("In if 2");
      let pf = (updated_amt/percent_allocation["gamount"])*100;
      goalCollection.updateOne({ "_id": id }, { $set: { gfulfilment: updated_amt,pfulfilment:pf }}); 
      priority_obj[gpriority] = updated_amt;
      amt1 += Number(updated_amt);
      }
      else if(updated_amt > percent_allocation["gamount"])
      {
        console.log("In if 3");
      let misc_amount1 = Number(updated_amt) -  Number(percent_allocation["gamount"]);
      userCollection.updateOne({"_id":userId},{$set:{"misc_amount" : misc_amount1}});
      goalCollection.updateOne({ "_id": id }, { $set: { gfulfilment: percent_allocation["gamount"],pfulfilment:100 }});
      priority_obj[gpriority] = percent_allocation["gamount"];
      amt1 += Number(percent_allocation["gamount"]);
      }
      
       let user_obj1 = await userCollection.find({}).toArray();
       let obj = user_obj1[0];
       let per1_amt = obj["percent_amount"];
       let savings1 = per1_amt["savings"];
       let new_savings = Number(savings1) +Number(savings);
      saving_obj = {
        "amt1": amt1,
        "savings": new_savings,
        "priority_n_amt": priority_obj
      };

      userCollection.updateOne({ "_id": userId }, { $set: { "percent_amount": saving_obj } });

      let distribute_savings_arr = await userCollection.find({}).toArray();
      let arr_obj = distribute_savings_arr[0];
     
      let percent_amount_assign = arr_obj["percent_amount"];
      let new_misc_amt = percent_amount_assign["savings"] - percent_amount_assign["amt1"];
    
      let misc = arr_obj["misc_amount"];
  
      let misc_amount2 = Number(misc) + Number(new_misc_amt);
   
      userCollection.updateOne({ "_id": userId }, { $set: { "misc_amount": misc_amount2 } });
      console.log("===SP:aft distri===");

    });
    return 1;
  },
  

};

module.exports = exportedMethods;
