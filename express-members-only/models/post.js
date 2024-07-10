const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: { type: String, required: true, maxLength: 100 },
  text: { type: String, required: true, maxLength: 500 },
  author: { type: Schema.Types.ObjectId, required: true, ref: "User" },
});

// Export model
module.exports = mongoose.model("Post", PostSchema);