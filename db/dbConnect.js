const mongoose = require('mongoose');

mongoose.connect(process.env.DB_URL)
  .then(() => {
    console.log("Mongoose Connected");
  })
  .catch((err) => {
    console.error("Error occured in mongoose ",err.message);
  });
