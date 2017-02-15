//TEST
/**
 * Example for creating and working with the Slack RTM API.
 */

/* eslint no-console:0 */


/*******************************************************************************
 * Globals
 */
const RtmClient = require('@slack/client').RtmClient;
const MemoryDataStore = require('@slack/client').MemoryDataStore;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const AWS = require('./AWS_API.js');
const GIT = require('./GITHUB_API.js');
const token = process.env.SLACK_API_TOKEN || '';
const DEBUG = process.env.DEBUG || false;
AWS.DEBUG = DEBUG;


var rtm;
var problemMessage = 'Looks like there was a problem processing your request.';
var activeConv = [];


/*Jarvis Include*/
var mainController = require('./mainController');

/*******************************************************************************
 * Functions
 */


var handleRtmMessage = function(message) {
    if (DEBUG) { console.log('Message:', message) }
    var text = message.text;
    var firstChar = message.channel.substring(0, 1);
    
    var initCommands = /^(hey jarvis,? ?)|^(jarvis,? ?)/i; //DO NOT ADD GLOBAL FLAG
    
    //Message is from a channel or group
    if (firstChar === 'C' | firstChar === 'G') {
        if (initCommands.test(text)){
            text = text.replace(initCommands, "");
            if(text.length > 0){
                if (DEBUG) { console.log("Greeting + Command")}
                message.text = text;
                parseCommand(message);
            }else{
                 if (DEBUG) { console.log("Greeting w/o Command")}
                var temp = new Conversation(message.user, message.channel);
                activeConv.push(temp);
                rtm.sendMessage("yes?", message.channel);
            }
        } else{
            //Check Active Conversations
        for (var i = 0, len = activeConv.length; i < len; i++){
            if(activeConv[i].user == message.user && activeConv[i].channel == message.channel){
                 if (DEBUG) { console.log("Conversation");
                rtm.sendMessage("processing command .. conversation continued", message.channel);}
                parseCommand(message);
                activeConv.splice(i,1);
                break;
            }

        }
            
        }
    }    //Direct Message to Jarvis
    else if (firstChar === 'D') {
        if (initCommands.test(text)){
            text = text.replace(initCommands, "");
            if(text.length > 0){
                 if (DEBUG) { console.log("DM Greeting + Command")}
                rtm.sendMessage("No need for initial commands in Direct Messages.", message.channel);
                message.text = text;
                parseCommand(message);
            }else{
                 if (DEBUG) { console.log("DM Greeting w/o Command")}
                rtm.sendMessage("No need to include initial commands in Direct Messages. Please enter command.", message.channel);
            }
        }
        else {
            parseCommand(message);
        }
    } 
    


}
var parseCommand = function(message) {
    var text = message.text;
     if (DEBUG) { console.log("Parsing Command: "+text)}
    if (keyMessage(text, 'aws ')) {
        text = text.substring('aws '.length, text.length);
        if (keyMessage(text, 'check ec2 ')) {
            text = text.substring('check ec2 '.length, text.length);
            if (keyMessage(text, 'instance ')) {
                handleMessagePromise(AWS.checkEC2Instance(text.substring('instance '.length, text.length)), message);
            } else {
                handleMessagePromise(AWS.checkEC2(), message);
            }
        } else if (keyMessage(text, 'check number of instances ')) {
            handleMessagePromise(AWS.checkNumInstances(), message);
        } else {
            rtm.sendMessage(rtm.dataStore.getUserById(message.user).name+" I'm sorry, this isn't an AWS command I'm familiar with.", message.channel);
        }
    } else if (keyMessage(text, 'slack ')) {
        text = text.substring('slack '.length, text.length);
        var userRegex = /<@([A-Z|1-9]+.)>/g;
        var channelRegex = /<?#([A-Z0-9]+)(\|\w+>)?/g;
        if (userRegex.test(text)) {
            var user = rtm.dataStore.getUserById(text.replace(userRegex, '$1'));
            rtm.sendMessage("User lookup: "+user.real_name/*+" "+JSON.stringify(user)*/, message.channel);
        } else if (channelRegex.test(text)) {
            var key = text.replace(channelRegex, '$1');
            var channel = rtm.dataStore.getChannelGroupOrDMById(key);
            
            rtm.sendMessage("Channel lookup: "+key/*+" "+JSON.stringify(channel)*/, message.channel);
        } else if (keyMessage(text, 'debug ')) {
            rtm.sendMessage("Debug: "+JSON.stringify(message), message.channel);
        } else {
        	rtm.sendMessage("Slack command DNE", message.channel);
        }
    } else if (keyMessage(text, 'git ')) {
		text = text.substring('git '.length, text.length);
			if (keyMessage(text, 'how many branches')) {
				getNumberofFeatureBranches("jessicalynn", "jarvis");
				handleMessagePromise(AWS.checkEC2Instance(text.substring('instance '.length, text.length)), message);
			  
    } else {
        rtm.sendMessage("I'm sorry, this isn't a command I'm familiar with.", message.channel);
    }
}

/*******************************************************************************
 * Helper functions
 */

function keyMessage(text, key) {
    var temptext = text + ' ';
    if (temptext.length >= key.length && temptext.substring(0, key.length).toLowerCase() === key) {
        return true;
    }
    return false;
}

function handleMessagePromise(promise, message) {
    promise.then(function (resp) {
        rtm.sendMessage(resp, message.channel);
    }, function (err) {
        rtm.sendMessage(problemMessage, message.channel);
        console.log(err);
    });
}

function Conversation(user, channel){
    this.user = user;
    this.channel = channel;
    this.active = false;
}

/*******************************************************************************
 * Test stuff
 */
/*
Sample inputs:
aws describe ec2 instance i-0a681657adec3b3ee
aws describe ec2
 */
var mockRTM = function() {
    var readline = require('readline');
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    process.stdout.write("Please input your test message text: ");
    rl.on('line', function (line) {
        var message = {
            'text': line,
            'channel': 3
        };

        // mocking rtm
        rtm = {};
        rtm.sendMessage = function(message, channel) {
            console.log('----------Response message----------');
            console.log('Text: ' + message);
            console.log('Channel: ' + channel);
        }

        // run the test
        handleRtmMessage(message);
    });
}


/*******************************************************************************
 * main()
 */

var main = function() {
    rtm = new RtmClient(token);
    rtm.start();

    rtm.on(RTM_EVENTS.MESSAGE, handleRtmMessage);

	rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function handleRTMAuthenticated() {
  	  console.log('Jarvis is Online.');
	});
	
	rtm.on(RTM_EVENTS.REACTION_ADDED, function handleRtmReactionAdded(reaction) {
	   if (DEBUG) { console.log('Reaction added:', reaction)}
	  rtm.sendMessage("Thanks "+rtm.dataStore.getUserById(reaction.user).name,reaction.item.channel);
	});

	rtm.on(RTM_EVENTS.REACTION_REMOVED, function handleRtmReactionRemoved(reaction) {
	   if (DEBUG) { console.log('Reaction removed:', reaction)}
	  rtm.sendMessage(":unamused: :"+reaction.reaction+":",reaction.item.channel);
	});
}

if (DEBUG) {
    mockRTM();
} else {
    main();
}

