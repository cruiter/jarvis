/**
 * Example for creating and working with the Slack RTM API.
 */

/* eslint no-console:0 */

var RtmClient = require('@slack/client').RtmClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var mainController = require('./mainController');
var MemoryDataStore = require('@slack/client').MemoryDataStore;



var token = process.env.SLACK_API_TOKEN || '';

var rtm = new RtmClient(token);
rtm.start();

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  console.log('Message:', message);

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
