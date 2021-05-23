var mongoose = require("mongoose");
var { Schema } = mongoose;
var notificationSchema = new Schema({
    username: String,
    campgroundId: String,
    isRead: {type:Boolean, default: false}
});
module.exports = mongoose.model("Notification", notificationSchema);