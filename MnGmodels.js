"strict use";

const mongoose = require('mongoose');
// added the promise from solution
mongoose.Promise = global.Promise;

const blogpostSchema = mongoose.Schema({
  title: { type: String, required: true},
  author: {
  firstName: String,
  lastName: String
  // required: true
  },
  content: { type: String },
  // added created variable from solution
  created: {type: Date, default: Date.now}
});

blogpostSchema.virtual("authorName").get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogpostSchema.methods.serialize = function() {
  return {
    id: this._id,
    title: this.title,
    author: this.authorName,
    content: this.content,
    // added created variable from solution
    created: this.created
  };
};

const Blog = mongoose.model("blogpost", blogpostSchema);

module.exports = { Blog };
