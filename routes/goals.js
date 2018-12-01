const express = require("express");
const router = express.Router();
const data = require("../data");
const goalData = data.goals;
const userData = data.users;
const userId = "18293ea2-1a06-4c55-8fb3-4e1acf0ba484";
try {
  // router.get("/new", (req, res) => {
  //   console.log("hi");
  //   res.render("goals/new");

  // });
  router.get("/add", async (req, res) => {
    res.render("edit_remove/addwish", {
      stylecss: "addnedit.css",
      sitecss: "style.css"
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

     res.render('dashb/dashboard', {
      sitecss: "site.css",
      stylecss: "style.css",
      goals: goalList
    });
  });
  router.get("/edit/:id", async (req, res) => {
    let getgoal = goalData.getgoalById(req.params.id);
    res.render("edit_remove/Editwish", {
      stylecss: "addnedit.css",
      sitecss: "style.css",
      goaldata: getgoal
    });
  });
  router.get("/:id", async (req, res) => {
    const goal = await goalData.getgoalById(req.params.id);
    res.render("goals/single", {
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
    console.log(goalList.length);
    res.render('./index', {
      sitecss: "site.css",
      stylecss: "style.css",
      goals: goalList
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
    var gtype = gname;
    if (wishGoalData.gname == "Other") {
      wishGoalData.gname = wishGoalData.gnameother;

    }
    // if (!wishGoalData.body) {
    //   errors.push("No body provided");
    // }
    if (!wishGoalData.gamount) {
      errors.push("No body provided");
    }

    // if (!wishGoalData.userId) {
    // errors.push("No goaler selected");
    // }
    // console.log(errors.length);
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
      // userData.addgoalToUser(userId, newgoal._id, newgoal.gname);

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