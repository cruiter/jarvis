/**
 * Example for creating and working with the Slack RTM API.
 */

/* eslint no-console:0 */


/* SLACK API*/
var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var MemoryDataStore = require('@slack/client').MemoryDataStore;

/*Jarvis Include*/
var mainController = require('./mainController');


//Grabs token form the environment. Initialized with startBot.sh
var token = process.env.SLACK_API_TOKEN || '';

//REAL TIME MESSAGING API
var rtm = new RtmClient(token);

//Start Jarvis Server
rtm.start();

//Online Message
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function handleRTMAuthenticated() {
  console.log('Jarvis is Online.');
});

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  console.log('Message:', message);
 // mainControllermessage.text;
  //rtm.sendMessage(mainController.git();
	rtm.sendMessage("User "+rtm.dataStore.getUserById(message.user).name+' posted a message in '+rtm.dataStore.getChannelGroupOrDMById(message.channel).name+" channel", message.channel);
    
    
});

rtm.on(RTM_EVENTS.REACTION_ADDED, function handleRtmReactionAdded(reaction) {
  console.log('Reaction added:', reaction);
  rtm.sendMessage("Thanks "+rtm.dataStore.getUserById(reaction.user).name,reaction.item.channel);
});

rtm.on(RTM_EVENTS.REACTION_REMOVED, function handleRtmReactionRemoved(reaction) {
  console.log('Reaction removed:', reaction);
});

