const goalRoutes = require("./goals");
const userRoutes = require("./users");

let constructorMethod = app => {
  app.use("/goal", goalRoutes);
  app.use("/user", userRoutes);
};

module.exports = {
  users: require("./users"),
  goals: require("./goals")
};
