const express = require("express");
const router = express.Router();
const data = require("../data");
const userData = data.users;
const metaData = data.metadata;
try {
  router.get("/:id", (req, res) => {
    userData
      .getUserById(req.params.id)
      .then(user => {
        res.json(user);
      })
      .catch(() => {
        res.status(404).json({
          error: "User not found"
        });
      });
  });

  router.get("/", (req, res) => {
    userData.getAllUsers().then(
      userList => {
        res.json(userList);
      },
      () => {
        // Something went wrong with the server!
        res.sendStatus(500);
      }
    );
  });

  router.post("/saving", async (req, res) => {
    let savingInfo = req.body;
    if (!savingInfo) {
      res.status(400).json({
        error: "You must provide savings"
      });
      return;
    }
    console.log(savingInfo);

    
    let distri_status = await userData.addSavingsToGoals(savingInfo.amount)
    if (distri_status == 1) {
      let mdata = await metaData.addTransaction(Number(savingInfo.amount));
      res.redirect('/goals');
    } else {
      res.sendStatus(500);
    }


  });



  router.post("/", async (req, res) => {
    let userInfo = req.body;
    console.log(userInfo);
    if (!userInfo) {
      res.status(400).json({
        error: "You must provide data to create a user"
      });
      return;
    }

    if (!userInfo.username) {
      res.status(400).json({
        error: "You must provide a user name"
      });
      return;
    }

    if (!userInfo.email) {
      res.status(400).json({
        error: "You must provide a email"
      });
      return;
    }

    if (userInfo.username == "administrator") {
      var a = await userData.getUserByusername(userInfo.username);
      console.log(a);
      if (a) {
        res.redirect("/goals");
      } else {
        console.log("hi");
        userData.addUser(userInfo.username, userInfo.username, userInfo.email).then(
          newUser => {
            console.log(newUser)
            res.redirect("http://localhost:4000/goals");
          },
          () => {
            res.sendStatus(500);
          }
        );
      }
    } else {
      res.redirect("http://localhost:4000/");
    }

  });

  router.put("/:id", (req, res) => {
    let userInfo = req.body;

    if (!userInfo) {
      res.status(400).json({
        error: "You must provide data to update a user"
      });
      return;
    }

    if (!userInfo.firstName) {
      res.status(400).json({
        error: "You must provide a first name"
      });
      return;
    }

    if (!userInfo.lastName) {
      res.status(400).json({
        error: "You must provide a last name"
      });
      return;
    }

    let getUser = userData
      .getUser(req.params.id)
      .then(() => {
        return userData.updateUser(req.params.id, userInfo).then(
          updatedUser => {
            res.json(updatedUser);
          },
          () => {
            res.sendStatus(500);
          }
        );
      })
      .catch(() => {
        res.status(404).json({
          error: "User not found"
        });
      });
  });

  router.delete("/:id", (req, res) => {
    let user = userData
      .getUserById(req.params.id)
      .then(() => {
        return userData
          .removePost(req.params.id)
          .then(() => {
            res.sendStatus(200);
          })
          .catch(() => {
            res.sendStatus(500);
          });
      })
      .catch(() => {
        res.status(404).json({
          error: "User not found"
        });
      });
  });

  module.exports = router;

} catch (e) {
  throw e;
}