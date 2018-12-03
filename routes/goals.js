const express = require("express");
const router = express.Router();
const data = require("../data");
const goalData = data.goals;
const userData = data.users;
const metaData = data.metadata;

try {
  // router.get("/new", (req, res) => {
  //   console.log("hi");
  //   res.render("goals/new");

  // });
  router.get("/add", async (req, res) => {
    const goalList = await goalData.getAllgoals();

    res.render("edit_remove/addwish", {
      stylecss: "addnedit.css",
      sitecss: "style.css",
      priorities: goalList.length + 1
    });
  });
  router.get("/aboutus", async (req, res) => {

    res.render('dashb/aboutus', {
      stylecss: "addnedit.css",
      sitecss: "style.css",
      aboutus: true
    });
  });
  router.get("/dashboard", async (req, res) => {
    // res.render("edit_remove/addwish", {
    //   stylecss: "addnedit.css",
    //   sitecss: "style.css"
    // });

    //  res.json({message:"dd"});
    // console.log(`${__dirname}\dashboard`);

    //  res.json({message:"dd"});

    const goalList = await goalData.getAllgoals();
    const metaList = await metaData.getAllTransactions();

    res.render('dashb/dashboard', {
      sitecss: "site.css",
      stylecss: "style.css",
      goals: goalList,
      transactions: metaList,
      dashboard: true,
      colorlist: ['#003f5c',
        '#ffa600',
        '#2f4b7c',
        '#ff7c43',
        '#665191',
        '#f95d6a',
        '#a05195',
        '#d45087',
        '#f0b8b8',
        '#e67f83',
        '#de425b'
      ]
    });
  });
  router.get("/edit/:id", async (req, res) => {

    let getgoal = await goalData.getgoalById(req.params.id);
    // res.json({message:"hi"});
    debugger;
    res.render("edit_remove/Editwish", {
      stylecss: "addnedit.css",
      sitecss: "style.css",
      goaldata: getgoal
    });

  });
  router.get("/:id", async (req, res) => {
    const goal = await goalData.getgoalById(req.params.id);
    res.render("./index", {
      goal: goal
    });
  });



  // router.get("/dashboard", async (req, res) => {
  //   // const goalList = await goalData.getAllgoals();



  //   console.log("hiiiiiiii");

  //   res.json({message:"jhgjkj"});

  //   // res.render('./dashboard', {
  //   //   sitecss: "site.css",
  //   //   stylecss: "style.css",
  //   //   goals: goalList
  //   // });
  // });


  router.get("/tag/:tag", (req, res) => {
    goalData.getgoalsByTag(req.params.tag).then(goalList => {
      res.render("goals/index", {
        goals: goalList
      });
    });
  });

  router.get("/", async (req, res) => {
    const goalList = await goalData.getAllgoals();
    const metaList = await metaData.getAllTransactions();
    const usersList = await userData.getAllUsers();
    // console.log(usersList);

    const user = usersList.find(x => x.firstName == "administrator");
    var total = 0;
    var last_transaction = 0;
    if (metaList.length > 0) {
      var currentdate = metaList[0].tAddedOn;
      total = metaList[0].tamount;
      last_transaction = metaList[0].tamount;
      for (var i = 1; i < metaList.length; i++) {
        total = total + metaList[i].tamount;
        if (+metaList[i].tAddedOn >= +currentdate) {
          currentdate = metaList[i].tAddedOn;
          last_transaction = metaList[i].tamount;
        }
      }
    }
    if (!isNaN(user.percent_amount.amt1) && (total >= user.percent_amount.amt1))
      user.misc_amount = total - user.percent_amount.amt1;
    if (isNaN(user.misc_amount) || user.misc_amount < 0)
      user.misc_amount = 0;

    res.render('./index', {
      sitecss: "site.css",
      stylecss: "style.css",
      goals: goalList,
      home: true,
      totalsavings: total,
      last_transaction: last_transaction,
      userdata: user
    });
    // res.render("goals/index", {
    //   goals: goalList
    // });
  });

  router.post("/remove", async (req, res) => {
    let removalData = req.body;
    if (!removalData) {
      res.status(400).json({
        error: "You must provide amount to remove"
      });
      return;
    }
    console.log(removalData);
    let removal_status = await goalData.emergencyRemoval(removalData.ramount);
    if (removal_status == 1) {
      let mdata = await metaData.addTransaction(Number(-removalData.ramount));
      res.redirect('/goals');
    } else {
      res.sendStatus(500);
    }

  });

  router.post("/", async (req, res) => {
    let wishGoalData = req.body;
    let errors = [];
    console.log(wishGoalData);
    if (!wishGoalData.gname) {
      errors.push("No Name provided");
    }
    var gtype = wishGoalData.gname;
    if (wishGoalData.gname == "Other") {
      wishGoalData.gname = wishGoalData.gnameother;

    }
    // if (!wishGoalData.body) {
    //   errors.push("No body provided");
    // }
    if (!wishGoalData.gamount) {
      errors.push("No body provided");
    }

    if (errors.length > 0) {
      console.log(errors);
      res.render("edit_remove/addwish", {
        stylecss: "addnedit.css",
        sitecss: "style.css",
        errors: errors,
        hasErrors: true,
        goal: wishGoalData
      });
      return;
    }

    try {
      const usersList = await userData.getAllUsers();
      console.log(usersList);
      const userId = usersList.find(x => x.firstName == "administrator")._id;

      const newgoal = await goalData.addgoal(
        wishGoalData.gname,
        // wishGoalData."most important",
        wishGoalData.gdescription,
        wishGoalData.tags || [],
        userId,
        wishGoalData.gamount,
        wishGoalData.gstatus,
        wishGoalData.gpriority,
        wishGoalData.gpercent,
        gtype

      );
      console.log(newgoal);
      // res.status(200).json(newgoal);
      // res.render('./index',{goals:goalData.getAllgoals()});
      res.redirect('/goals');
    } catch (e) {
      console.log(e);
      res.status(500).json({
        error: e
      });
    }
  });

  router.put("/:id", (req, res) => {
    let updatedData = req.body;

    let getgoal = goalData.getgoalById(req.params.id);

    getgoal
      .then(() => {
        return goalData
          .updategoal(req.params.id, updatedData)
          .then(updatedgoal => {
            res.json(updatedgoal);
          })
          .catch(e => {
            res.status(500).json({
              error: e
            });
          });
      })
      .catch(() => {
        res.status(404).json({
          error: "goal not found"
        });
      });
  });

  router.delete("/:id", (req, res) => {
    let getgoal = goalData.getgoalById(req.params.id);

    getgoal
      .then(() => {
        return goalData
          .removegoal(req.params.id)
          .then(() => {
            res.sendStatus(200);
          })
          .catch(e => {
            res.status(500).json({
              error: e
            });
          });
      })
      .catch(() => {
        res.status(404).json({
          error: "goal not found"
        });
      });
  });

  module.exports = router;
} catch (e) {
  throw "Problem in goals routes";
}