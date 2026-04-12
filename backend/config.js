require('dotenv').config();

module.exports = {
  MONGO_URI: process.env.MONGO_URI || "mongodb+srv://anudeep:Anudeep%404091@busticket.mwvyuly.mongodb.net/busticket?retryWrites=true&w=majority",
  PORT: process.env.PORT || 5001,
  FARE: process.env.FARE || 20
};
