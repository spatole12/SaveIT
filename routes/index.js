const goalRoutes = require("./goals");
const userRoutes = require("./users");
const path = require("path");

const constructorMethod = app => {
  app.use("/goals", goalRoutes);
  app.use("/users", userRoutes);
  // app.use("/edit_remove", edit_add);
  // app.get("/", (req, res) => {
  //   res.render('./index',{})
  // });

  app.use("*", (req, res) => {
    res.sendFile(path.resolve("static/login.html"));
  });
};

module.exports = constructorMethod;