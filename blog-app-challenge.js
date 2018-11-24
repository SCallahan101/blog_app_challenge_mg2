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
app.get('/blogposts', (req, res) => {
  Blog
  .find()
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

app.get('/blogposts/:id', (req, res) => {
  Blog
  .findbyId(req.params.id)
  .then(post => res.json(post.serialize()))
  .catch(err => {
    console.error(err);
    res.status(500).json({ message: "Internal service error"});
  });
});

app.post('/blogposts', (req, res) => {
  const requiredFields = ['title','author', 'content'];
  for(let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if(!(field in res.body)) {
      const message = `Missing \`${field}\` in request body`;
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

app.put('/blogposts/:id', (req, res) => {
  if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message =
    `Request path id (${req.params.id}) and request body id` +
    `(${req.body.id}) must match`;
    console.error(message);
    return res.status(400).json({ message: message });
  }
  const toUpdate = {};
  const updateableFields = ["title", "author", "content"];
  updateableFields.forEach(field => {
    if(field in res.body) {
      toUpdate[field] = res.body[field];
    }
  });
  Blog
  .findByIdAndUpdate(req.params.id, {$set: toUpdate}, {new: true})
  .then(post => res.status(204).end())
  .catch(err => res.status(500).json({
    message: 'Internal service error'}));
});

app.delete('/blogposts/:id', (req, res) => {
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
