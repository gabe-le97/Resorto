var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

// how users are stored in the database
var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    isAdmin: {type: Boolean, default: false}
});

UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", UserSchema);