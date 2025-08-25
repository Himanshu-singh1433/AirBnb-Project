const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
        filename :String,
        url :String
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type:Schema.Types.ObjectId,
            ref:"Review",
        },
    ],
});
const Listing = mongoose.model("Listing", listingSchema);
//main file ka sub-part hai.same folder me other file ko export karate hai.
module.exports = Listing;