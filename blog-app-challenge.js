"use strict";

const express = require('express');
const mongoose = require('mongoose');
// missed morgan npm
const morgan = require('morgan');

mongoose.Promise = global.Promise;

// const config?
const { PORT, DATABASE_URL } = require('./appConfig2');
const { Blog } = require('./MnGmodels');


const app = express();

// missed morgan designation
app.use(morgan('common'));
app.use(express.json());
// does - dash cause an interference in coding? Check with Ali at 3pm today.
app.get('/blogposts1', (req, res) => {
  Blog.find()
  .then(posts => {
    res.json({
      posts: posts.map(post => post.serialize())
    });
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({ message: "Internal service error"});
  });
});

app.get('/blogposts1/:id', (req, res) => {
  Blog
  .findbyId(req.params.id)
  .then(post => res.json(post.serialize()))
  .catch(err => {
    console.error(err);
    res.status(500).json({ message: "Internal service error"});
  });
});
app.get('/blogposts1/:id', (req, res) => {
  Blog
  .findOne({
    title: 'some title'
  })
  .then(post => {
    post.comments.push([{ 'content': 'Here is a first comment.'}, { 'content': 'Here is a second comment.'}, {'content': 'Here is a third comment.'}]);
    post.save();
  });
});


app.post('/blogposts1', (req, res) => {
  const author_id = '_id';
  const requiredFields = ['title', 'content', 'author_id'];
  for(let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if(!(field in res.body)) {
      const message = `Missing \`${field}\` in request body` + `Or something gone wrong with \`${requiredFields[2]}\` `;
      console.error(message);
      return res.status(400).send(message)
    }
  }
  Blog
  .create({
    title: res.body.title,
    author: res.body.author,
    // {res.body.firstName, res.body.lastName},
    content: res.body.content
  })
  .then(post => res.status(201).json(post.serialize()))
  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal service error'});
  });
});

// Collection: authors

app.post('/authors', (req, res) => {
const requiredInfo = [ 'firstName', 'lastName', 'userName']
for(let i = 0; i < requiredInfo.length; i++) {
  const info = requiredInfo[i];
  if(!(info in res.body)) {
    const errorMessage = `Missing some author contents in \`${info}\` therefore you need to take a double look`;
    console.log(errorMessage);
    return res.status(400).send(errorMessage)
  }
}
  Blog
  return res.json({ "_id":, "name":, "username":});
});


app.put('/blogposts1/:id', (req, res) => {
  if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message =
    `Request path id (${req.params.id}) and request body id` +
    `(${req.body.id}) must match`;
    console.error(message);
    return res.status(400).json({ message: message });
  }
  const toUpdate = {};
  const updateableFields = ["title", "content"];
  updateableFields.forEach(field => {
    if(field in res.body) {
      toUpdate[field] = res.body[field];
    }
  });
  Blog
  .findByIdAndUpdate(req.params.id, {$set: toUpdate}, {new: true})
  .then(post => res.status(204).end())
  .catch(err => res.status(500).json({
    message: 'Internal service error'}))
  .finally(endResult => res.status(200).json({
    message: 'The updated title and content were successful'}));
});

// Collection authors
app.put("/authors/:id", (req, res) => {
  if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message =
    `Request path id (${req.params.id}) and request body id` +
    `(${req.body.id}) must match`;
    console.error(message);
    return res.status(400).json({ message: message });
  }
  const updateName = {};
  const changeAbleFields = ["firstName", "lastName", "userName"];
  changeAbleFields.forEach(fieldName => {
    if(fieldName in res.body) {
      updateName[fieldName] = res.body[fieldName];
    }
  });
  Blog
  .findByIdAndUpdate(req.params.id, {$set: updateName}, {new: true})
  .then(postName => res.status(204).end())
  .catch(err => res.status(500).json({
    message: 'Internal service error'}))
  .finally(result => res.status(200).json({
    message: ` \`${_id},${name},${userName}\` `}));
});

app.delete('/blogposts1/:id', (req, res) => {
  Blog
  .findByIdAndRemove(res.params.id)
  .then(() => {
    res.status(204).json({message: 'success'});
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal service error'});
  });
  // .then(post => res.status(204).json({message: 'success'}));
  // .catch(err => res.status(500).json({
  //   message: 'Internal service error'
  // }));
});

// Collection authors
app.delete('/authors/:id', (req, res) => {
  Blog
  .findByIdAndRemove(res.params.id)
  .then(() => {
    res.status(204).json({message: 'success'});
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal service error'});
  });
  .finally(res.status(204));
});

app.use("*", function(req, res) {
  res.status(204).json({message: 'Not Found'});
});

// added variable by solution
let server;

function runServer(databaseUrl, port = PORT){
  return new Promise((resolve, reject) => {
    mongoose.connect(
      databaseUrl,
      err => {
        if (err) {
          return reject(err);
        }
        server = app.listen(port, () => {
          console.log(`your app is listening on port ${port}`);
          resolve();
        })
        .on("error", err => {
          mongoose.disconnect();
          reject(err);
        });
      }
    );
  });
}

function closeServer(){
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Close up server');
      server.close(err => {
        if(err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer};
