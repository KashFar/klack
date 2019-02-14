const express = require("express");
const querystring = require("querystring");
const mongoose = require("mongoose")
const url = process.env.MONGODBURL || "mongodb://heroku_7sbkpxlv:afrkvd577ri1bt2uktbka7jq07@ds119085.mlab.com:19085/heroku_7sbkpxlv"

const port = process.env.PORT || 3000;
const app = express();

// List of all messages
// need to add message schema, similar to rsvp assessment. and create instance of message schema
let messages = [];

// Track last active times for each sender
let users = {};

mongoose.connect(url, {useNewUrlParser: true})     // matches variable on line 4

const db = mongoose.connection
db.on('error',console.error.bind(console.error, 'connection error:'))

//db.onc is from mongodb learning stuff  
//this is for initial load of the page. peters doesn't do this, and waits until the message loads.
db.once('open',() => {
  Message.find(function(err, messages){
    if(err) return console.error(error)
    messages.forEach(message=>{
      if(users[message.sender]=== undefined){
        //user does not exist
        users[message.sender]=message.timestamp
      } else{
        //user exists
        if(message.timestamp > users[message.sender])
        users[message.sender]=message.timestamp
      }
    })
  })
  app.listen(port);
})

messageSchema = mongoose.Schema({
  sender: {type: String, required: true},
  message: {type: String, required: true},
  timestamp: {type: Number, required: true}
})

const Message = mongoose.model('Message', messageSchema)

app.use(express.static("./public"));
app.use(express.json());

// generic comparison function for case-insensitive alphabetic sorting on the name field
function userSortFn(a, b) {
  var nameA = a.name.toUpperCase(); // ignore upper and lowercase
  var nameB = b.name.toUpperCase(); // ignore upper and lowercase
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  // names must be equal
  return 0;
}

app.get("/messages", (request, response) => {
  // get the current time
  const now = Date.now();

  // consider users active if they have connected (GET or POST) in last 15 seconds
  const requireActiveSince = now - 15 * 1000;

  // create a new list of users with a flag indicating whether they have been active recently
  usersSimple = Object.keys(users).map(x => ({
    name: x,
    active: users[x] > requireActiveSince
  }));

  // sort the list of users alphabetically by name
  usersSimple.sort(userSortFn);
  usersSimple.filter(a => a.name !== request.query.for);
  // advanced user transformations. Similar to code wars problems.
  // matches things in the filters array to make sure it matches get request

  // update the requesting user's last access time
  users[request.query.for] = now;

  // send the latest 40 messages and the full user list, annotated with active flags
  Message.find(function (err, messages) {
    if (err) return console.error(err)

    response.send({ messages: messages.slice(-40), users: usersSimple });
  })
});

// one for local one for global whe nits hosted the nit has both message.finds

app.post("/messages", (req, res) => {
  const message = new Message ({
        sender:  req.body.sender,
        message: req.body.message,
        timestamp: Date.now()
  })
  message.save()
      // users[message.sender]=message.timestamp
    
      res.status(201)
      res.send(message)

  // send needs to be the last thing. You can't edit edit the response anymore. 
  // you can only have one response.send
})

// APP.POST COMMENTS FROM STARTER CODE 
// add a timestamp to each incoming message.
// const timestamp = Date.now();
// request.body.timestamp = timestamp;

// append the new message to the message list
// messages.push(request.body);

// update the posting user's last access timestamp (so we know they are active)
// users[request.body.sender] = timestamp;

// Send back the successful response.
// response.status(201)