//TEST
/**
 * Example for creating and working with the Slack RTM API.
 */

/* eslint no-console:0 */


/*******************************************************************************
 * Globals
 */
const RtmClient = require('@slack/client').RtmClient;
const WebClient = require('@slack/client').WebClient;
const MemoryDataStore = require('@slack/client').MemoryDataStore;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const AWS = require('./AWS_API.js');
const GIT = require('./GITHUB_API.js');
const MAINCTL = require('./mainController.js');
const token = process.env.SLACK_API_TOKEN || '';
const DEBUG = process.env.DEBUG || false;

AWS.DEBUG = DEBUG;


var rtm;
var slackWeb = new WebClient(token);
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

    var initCommands = new RegExp ("^(hey jarvis,? ?)|^(jarvis,? ?)|^(<@"+rtm.activeUserId+">,? ?)", "i");

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
                startConversation("", message);
                rtm.sendMessage("yes?", message.channel);
            }
        } else{
            continueConversation(message);
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
        } else {
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
            rtm.sendMessage("AWS command does not exist", message.channel);
        }
    } else if (keyMessage(text, 'slack ')) {
        text = text.substring('slack '.length, text.length);
        var userRegex = /<@([A-Z|1-9]+.)>/g;
        var channelRegex = /<?#([A-Z0-9]+)(\|\w+>)?/g;
        if (userRegex.test(text)) {
            var user = rtm.dataStore.getUserById(text.replace(userRegex, '$1'));
            handleMessagePromise(slackUserName(user), message);
        } else if (channelRegex.test(text)) {
            var key = text.replace(channelRegex, '$1');
            handleMessagePromise(slackChannelInfo(key), message);
        } else if (keyMessage(text, 'list users ')) {
            handleMessagePromise(slackTeamList(), message);
        } else if (keyMessage(text, 'whoami ')) {
            handleMessagePromise(slackWhoAmI(), message);
        } else if (keyMessage(text, 'whos online ')) {
            handleMessagePromise(slackWhoseOnline(), message);
        } else if (keyMessage(text, 'debug ')) {
            rtm.sendMessage("Debug: "+JSON.stringify(message), message.channel);
        } else {
            rtm.sendMessage("Slack command does not exist", message.channel);
        }
    } else if (keyMessage(text, 'git ')) {
		text = text.substring('git '.length, text.length);
			if (keyMessage(text, 'branches')) {
				handleMessagePromise(GIT.checkNumberofFeatureBranches(), message);
			}else if (keyMessage(text, 'pushed')){
				handleMessagePromise(GIT.checkLastPushedtoBranchName(), message);
			}else if (keyMessage(text, 'open pull')){
				handleMessagePromise(GIT.checkLatestPullRequest(), message);
			}else if (keyMessage(text, 'closed pull')){
				handleMessagePromise(GIT.checkLatestClosedPullRequest(), message);
			}else if (keyMessage(text, 'time')){
			     handleMessagePromise(GIT.checkLatestBranchUpdatgeTime(), message);	
			}else if (keyMessage(text, 'contributors')){
			     handleMessagePromise(GIT.checkContributors(), message);
			}else {
				rtm.sendMessage("Git Command does not exist", message.channel);
			}
    }else if (keyMessage(text, 'help ')) {
        handleMessagePromise(MAINCTL.getActiveCommands(), message);
    }
    //SAMPLE CONVERSATION CONSTRUCT
    else if (keyMessage(text, 'wait ')) {
		text = text.substring('wait '.length, text.length);
        if(text.length == 0){
            startConversation("wait -1 ",message);
            rtm.sendMessage("I'm Listening for another command", message.channel);
        }else if (keyMessage(text, '-1 ')){
            text = text.substring('-1 '.length, text.length);
            if (keyMessage(text, 'don\'t wait ')){
                rtm.sendMessage(endConversation(message)?"Okay, I wont.":"Didn't work.", message.channel);
            } else {
                var word = /[a-z]+/i;
                var num = /[0-9]+/i;
                if(word.test(text)){
                    rtm.sendMessage("Letters.", message.channel);
                }else if(num.test(text)){
                    rtm.sendMessage("Numbers.", message.channel);
                }else{
                    rtm.sendMessage("Neither letters nor numbers.", message.channel);
                }
            }
        }
    }
    else {
        rtm.sendMessage("I'm sorry, this isn't a command I'm familiar with. use `help` command for list of commands", message.channel);
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
function startConversation (respCmd, message){
    var temp = new Conversation(message.user, message.channel);
    temp.cmdForResp = respCmd;
    activeConv.push(temp);
    if (DEBUG) { console.log("Started Conversatoion: " + message.user + " "+respCmd+". Number of Convos: "+activeConv.length);}
}
function continueConversation (message){
    var convIndex = getActiveConv(message.user,message.channel);
    if (typeof convIndex == "number"){
        if (DEBUG) { console.log("Response Altered Command: "+activeConv[convIndex].cmdForResp + message.text);}
        message.text = activeConv[convIndex].cmdForResp + message.text;
        endConversation(message);
        parseCommand(message);
    }
    
}
function endConversation (message){
    var convIndex = getActiveConv(message.user,message.channel);
    if (typeof convIndex == "number"){
        activeConv.splice(convIndex,1);
        if (DEBUG) { console.log("ending Conversation:" + message.user+ ". Number of Convos: "+activeConv.length);}
        return true;
    }
    else{
        return false;
    }
}

function Conversation(user, channel){
    this.user = user;
    this.channel = channel;
    this.cmdForResp = "";
}
function getActiveConv(user, channel){
    for (var i = 0, len = activeConv.length; i < len; i++){
        if(activeConv[i].user == user && activeConv[i].channel == channel){
             if (DEBUG) { 
                console.log("Conversation");
                rtm.sendMessage("processing command .. conversation continued", message.channel);
             }
            return i;
        }

    }
    return undefined;
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
            'channel': 'D'
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
        if(reaction.item_user == rtm.activeUserId){
        rtm.sendMessage("Thanks "+rtm.dataStore.getUserById(reaction.user).name,reaction.item.channel);}
    });

    rtm.on(RTM_EVENTS.REACTION_REMOVED, function handleRtmReactionRemoved(reaction) {
        if (DEBUG) { console.log('Reaction removed:', reaction)}
        if(reaction.item_user == rtm.activeUserId){
        rtm.sendMessage(":unamused: :"+reaction.reaction+":",reaction.item.channel);}
    });
}
process.on('SIGINT', function() {
    if(rtm.connected){
      rtm.disconnect();  
      console.log("\nJarvis is going offline.")
    }
    
    process.exit();
});


if (DEBUG) {
    mockRTM();
} else {
    main();
}




/*******************************************************************************
 * SLACK API CALLS
 */
/**
 * Checks the status of all of the EC2 Instances
 * @return {Promise}
 */
var slackWhoseOnline = function() {
    if (exports.DEBUG) { console.log('Slack Web API Called, Who is Online Command') }

    return new Promise(function(fulfill, reject) {
        //query for the status of all instances
        slackWeb.users.list({presence:true}, function teamInfoCb(err, info) {
             if (err) {
                return reject(err);
              } else {
                  var tResponse = "";
                  for(var i = 0; i < info.members.length;i++){
                     if(info.members[i].presence && info.members[i].presence == "active"){
                         if(info.members[i].real_name != "")
                             {
                                 tResponse += info.members[i].profile.first_name + " "
                             }else{
                                 tResponse += info.members[i].name + " "
                             }
                             
                  }
                  }
                  
                fulfill("Online: "+tResponse);  
              }
            });
    });
}
/**
 * Checks the status of all of the EC2 Instances
 * @return {Promise}
 */
var slackTeamList = function() {
    if (exports.DEBUG) { console.log('Slack Web API Called, Team Member List Command') }

    return new Promise(function(fulfill, reject) {
        slackWeb.users.list(function teamInfoCb(err, info) {
              if (err) {
                return reject(err);
              } else {
                var userList = info.members
                var tMessage = "There users on this team are: ";
                for(var i = 0; i < userList.length; i++){
                    tMessage += userList[i].real_name+" ("+userList[i].name+"), "
                }
                fulfill(tMessage);  
              }
            });
        //query for the status of all instances
    });
}
/**
 * Checks the status of all of the EC2 Instances
 * @return {Promise}
 */
var slackWhoAmI = function() {
    if (exports.DEBUG) { console.log('Slack Web API Called, Team Member List Command') }

    return new Promise(function(fulfill, reject) {
                fulfill("Jarvis Info: <@"+rtm.dataStore.getUserById(rtm.activeUserId).name+"> on team: " + rtm.dataStore.getTeamById(rtm.activeTeamId).name);  
    });
}

/**
 * Checks the status of all of the EC2 Instances
 * @return {Promise}
 */
var slackChannelInfo = function(channelName) {
    if (exports.DEBUG) { console.log('Slack Web API Called, Team Member List Command') }

    return new Promise(function(fulfill, reject) {
        slackWeb.channels.info(channelName,function teamInfoCb(err, info) {
              if (err) {
                return reject(err);
              } else {
                  var tResponse = "Channel Lookup: <#" +info.channel.id+"> Members: ";
                  var members = info.channel.members;
                  for (var i = 0; i < members.length; i++){
                      tResponse += rtm.dataStore.getUserById(members[i]).name + " ";
                  }
                  
                fulfill(tResponse);  
              }
            });
        //query for the status of all instances
    });
}
/**
 * Checks the status of all of the EC2 Instances
 * @return {Promise}
 */
var slackUserName = function(nameToLook) {
    if (exports.DEBUG) { console.log('Slack Web API Called, Team Member List Command') }

    return new Promise(function(fulfill, reject) {
                fulfill("User lookup: "+nameToLook.real_name/*+" "+JSON.stringify(user)*/);  
    });
}