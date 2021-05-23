var mongoose = require("mongoose");
// mongoose.connect('mongodb://localhost:27017/yelp_camp', { useNewUrlParser: true });
var { Schema } = mongoose;
var commentSchema = new Schema({
    text: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    author: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        username: String
    }

});
var Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;