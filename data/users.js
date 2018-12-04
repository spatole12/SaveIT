const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;
const goals = mongoCollections.goals;
const uuid = require("node-uuid");

var nodemailer = require('nodemailer');

let exportedMethods = {
  getAllUsers() {
    return users().then(userCollection => {
      return userCollection.find({}).toArray();
    });
  },
  // This is a fun new syntax that was brought forth in ES6, where we can define
  // methods on an object with this shorthand!
  getUserByusername(username) {
    return users().then(userCollection => {
      return userCollection.findOne({
        firstName: username
      }).then(user => {
        if (!user) return false;
        else
          return true;
      });
    });
  },

  getUserById(id) {
    return users().then(userCollection => {
      return userCollection.findOne({

        _id: id
      }).then(user => {
        if (!user) throw "User not found";

        return user;
      });
    });
  },
  addUser(firstName, lastName, email) {
    console.log(firstName + lastName);
    return users().then(userCollection => {
      let newUser = {
        firstName: firstName,
        lastName: lastName,
        _id: uuid.v4(),
        goals: [],
        email: email,
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
      return userCollection.removeOne({
        _id: id
      }).then(deletionInfo => {
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

      return userCollection.updateOne({
        _id: id
      }, updateCommand).then(() => {
        return this.getUserById(id);
      });
    });
  },
  addgoalToUser(userId, goalId, goalTitle) {
    return this.getUserById(id).then(currentUser => {
      return userCollection.updateOne({
        _id: id
      }, {
        $addToSet: {
          goals: {
            id: goalId,
            gname: goalTitle
          }
        }
      });
    });
  },
  removegoalFromUser(userId, goalId) {
    return this.getUserById(id).then(currentUser => {
      return userCollection.updateOne({
        _id: id
      }, {
        $pull: {
          goals: {
            id: goalId
          }
        }
      });
    });
  },
  async addSavingsToGoals(savings) {
    console.log("===SP:In addSavings===");
    var userCollection1 = await users();
    // console.log("userCollection1:"+JSON.stringify(userCollection1));
    var userIS = await userCollection1.findOne({
      "firstName": "administrator"
    });
    var userID = JSON.stringify(userIS);
    var userID = JSON.parse(userID);
    var userId = userID._id;
    let amt1 = 0;
    let amount = 0;
    let first_prior_amt = 0;
    let goalCollection = await goals();
    let allgoals = await goalCollection.find({}).toArray();
    let priority_obj = [];
    let saving_obj = {};
    if (allgoals.length == 0) {

      let userCollection = await users();
      let udata = await userCollection.findOne({
        "firstName": "administrator"
      });
      udata = JSON.stringify(udata);
      udata = JSON.parse(udata);
      var misc = udata.misc_amount;
      var save = udata.percent_amount.savings;
      if (isNaN(misc)) {
        misc = 0;
      }
      userCollection.updateOne({
        "_id": userId
      }, {
        $set: {
          "misc_amount": Number(misc) + Number(savings),
          "percent_amount": {
            "priority_n_amt": {},
            "amt1": 0,
            "savings": Number(save) + Number(savings)
          }
        }
      });
    } else {
      console.log("here");
      for (var k = 0; k < allgoals.length; k++) {
        let userCollection = await users();
        let id = allgoals[k]["_id"];
        let gpriority = allgoals[k]["gpriority"];
        if (gpriority == 1) {
          amount = (allgoals[k]["gpercent"] * savings) / 100;
          first_prior_amt = amount;
          //priority_obj[gpriority] = amount;
          //amt1 += amount;
        } else {
          let rem_amt5 = savings - first_prior_amt;
          amount = (allgoals[k]["gpercent"] * rem_amt5) / 100;
          // priority_obj[gpriority] = amount;
          // amt1 += amount;
        }
        let updated_amt = Number(amount) + Number(allgoals[k]["gfulfilment"]);
        if (updated_amt <= allgoals[k]["gamount"]) {
          let pf = (updated_amt / allgoals[k]["gamount"]) * 100;
          goalCollection.updateOne({
            "_id": id
          }, {
            $set: {
              gfulfilment: updated_amt,
              pfulfilment: pf
            }
          });
          priority_obj[gpriority] = updated_amt;
          amt1 += Number(updated_amt);
        } else if (updated_amt > allgoals[k]["gamount"] && !(allgoals[k]["gamount"] == allgoals[k]["gfulfilment"])) {

          let userCollection = await users();
          let udata = await userCollection.findOne({
            "firstName": "administrator"
          });
          udata = JSON.stringify(udata);
          udata = JSON.parse(udata);
          var misc1 = udata.misc_amount;
          let misc_amount1 = Number(updated_amt) - Number(allgoals[k]["gamount"]);
          userCollection.updateOne({
            "_id": userId
          }, {
            $set: {
              "misc_amount": misc1 + misc_amount1
            }
          });
          goalCollection.updateOne({
            "_id": id
          }, {
            $set: {
              gfulfilment: allgoals[k]["gamount"],
              pfulfilment: 100
            }
          });
          priority_obj[gpriority] = allgoals[k]["gamount"];
          amt1 += Number(allgoals[k]["gamount"]);
          let goalobj = await goalCollection.findOne({
            "_id": id
          });
          let user_obj = await userCollection.findOne({
            "_id": userId
          });
          let per = user_obj;
          var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'saveit.team@gmail.com',
              pass: 'save1234'
            }
          });
          var mailOptions = {
            from: 'saveit.team@gmail.com',
            to: per.email,
            subject: 'Your Goal ' + goalobj.gname + ' is accomplished',
            text: 'Congratulations! Your have enough savings to accomplish your goal: ' + goalobj.gname + '.'
          };

          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
        } else {
          let userCollection = await users();
          let udata = await userCollection.findOne({
            "firstName": "administrator"
          });
          udata = JSON.stringify(udata);
          udata = JSON.parse(udata);
          var misc1 = udata.misc_amount;
          let misc_amount1 = Number(updated_amt) - Number(allgoals[k]["gamount"]);
          userCollection.updateOne({
            "_id": userId
          }, {
            $set: {
              "misc_amount": misc1 + misc_amount1
            }
          });
        }
        let user_obj1 = await userCollection.findOne({
          "_id": userId
        });
        let obj = user_obj1;
        let per1_amt = obj["percent_amount"];
        let savings1 = per1_amt["savings"];
        let new_savings = Number(savings1) + Number(savings);
        saving_obj = {
          "amt1": amt1,
          "savings": new_savings,
          "priority_n_amt": priority_obj
        };
        console.log(saving_obj);
        userCollection.updateOne({
          "_id": userId
        }, {
          $set: {
            "percent_amount": saving_obj
          }
        });

        let arr_obj = await userCollection.findOne({
          "_id": userId
        });
        //  = distribute_savings_arr[0];

        let percent_amount_assign = arr_obj["percent_amount"];
        let new_misc_amt = percent_amount_assign["savings"] - percent_amount_assign["amt1"];

        let misc = arr_obj["misc_amount"];

        let misc_amount2 = Number(misc) + Number(new_misc_amt);

        userCollection.updateOne({
          "_id": userId
        }, {
          $set: {
            "misc_amount": new_misc_amt
          }
        });


      }
      // allgoals.forEach(async function (allgoals[k]) {});
    }

    return 1;
  },


};

module.exports = exportedMethods;