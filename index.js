const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const UserRoutes = require("./routes/user");
const FriendsRoute = require('./routes/friends');
const MessagesRoute = require('./routes/messages');

// Setting Middle Wares 
app.use(bodyParser.json());

// Integrating MLAB Database
require('./database');


// Port Setting
app.set('port', 6900 || process.env.PORT);

// Setting Default folder
app.use(express.static('public'));


// Setting Routes
app.use(UserRoutes);
app.use('/friends', FriendsRoute)
app.use('/message', MessagesRoute);

app.listen(app.get('port'), function () {
    console.log(`Server is Started on ${app.get('port')}`);
});