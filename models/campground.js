var mongoose = require("mongoose");
// mongoose.connect('mongodb://localhost:27017/yelp_camp', { useNewUrlParser: true });
var { Schema } = mongoose;
var campgroundSchema = new Schema({
    name: String,
    price: Number,
    image: String,
    imageID: String,
    description: String,
    location: String,
    lat: Number,
    lng: Number,
    createdAt: {
        type: Date,
        default: Date.now
    },
    author: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});
var Campground = mongoose.model("Campground", campgroundSchema);
module.exports = Campground;