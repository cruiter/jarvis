/**
 * Example for creating and working with the Slack RTM API.
 */

/* eslint no-console:0 */

/*******************************************************************************
 * Globals
 */
const RtmClient = require('@slack/client').RtmClient;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const AWS = require('./AWS_API.js');

const token = process.env.SLACK_API_TOKEN || '';
const DEBUG = process.env.DEBUG || false;
AWS.DEBUG = DEBUG;


/*******************************************************************************
 * Functions
 */

var handleRtmMessage = function(message) {
    if (DEBUG) { console.log('Message:', message) }

    var text = message.text;

    if (keyMessage(text, 'aws ')) {
        text = text.substring('aws '.length, text.length);
        if (keyMessage(text, 'describe ec2 ')) {
            text = text.substring('describe ec2 '.length, text.length);
            if (keyMessage(text, 'instance ')) {
                AWS.checkEC2Instance(text.substring('instance '.length, text.length)).then(function (resp) {
                    rtm.sendMessage(resp, message.channel);
                }, function (err) {
                    rtm.sendMessage('Looks like there was a problem processing your request', message.channel);
                    console.log(err);
                });
            } else {
                AWS.checkEC2().then(function (resp) {
                    rtm.sendMessage(resp, message.channel);
                }, function (err) {
                    rtm.sendMessage('Looks like there was a problem processing your request', message.channel);
                    console.log(err);
                });
            }
        } else if (keyMessage(text, 'check number of instances ')) {
            AWS.checkNumInstances().then(function (resp) {
                rtm.sendMessage(resp, message.channel);
            }, function (err) {
                rtm.sendMessage('Looks like there was a problem processing your request', message.channel);
                console.log(err);
            });
        } else {
            rtm.sendMessage("I'm sorry, this isn't an AWS command I'm familiar with.", message.channel);
        }
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
    var rtm = new RtmClient(token);
    rtm.start();

    rtm.on(RTM_EVENTS.MESSAGE, handleRtmMessage);

    rtm.on(RTM_EVENTS.REACTION_ADDED, function handleRtmReactionAdded(reaction) {
        console.log('Reaction added:', reaction);
    });

    rtm.on(RTM_EVENTS.REACTION_REMOVED, function handleRtmReactionRemoved(reaction) {
        console.log('Reaction removed:', reaction);
    });
}

if (DEBUG) {
    mockRTM();
} else {
    main();
}