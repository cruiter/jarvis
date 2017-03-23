const AWS = require('./AWS_API.js');
const GIT = require('./GITHUB_API.js');
const SLACK = require('./SlackInterface.js');
const pass = process.env.PASS || '';
const DEBUG = module.exports.DEBUG;
AWS.DEBUG = DEBUG;

//Main Controller Code

exports.parseCommand = function(message) {
    var text = message.text;
     if (DEBUG) {console.log("Parsing Command: "+text)}
    if (keyMessage(text, 'aws ')) {
        text = text.substring('aws '.length, text.length);
        if (keyMessage(text, 'check ec2 ')) {
            text = text.substring('check ec2 '.length, text.length);
            if (keyMessage(text, 'instance ')) {
                SLACK.handleMessagePromise(AWS.checkEC2Instance(text.substring('instance '.length, text.length)), message);
            } else {
                SLACK.handleMessagePromise(AWS.checkEC2(), message);
            }
        } else if (keyMessage(text, 'check number of instances ')) {
            SLACK.handleMessagePromise(AWS.checkNumInstances(), message);
        } else if (keyMessage(text, 'get cost of ')) {
            SLACK.handleMessagePromise(AWS.getTotalInstanceCost(text.substring('get cost of '.length, text.length)), message);
        } else {
            SLACK.sendMessage("AWS command does not exist", message);
        }
    } else if (keyMessage(text, 'slack ')) {
        text = text.substring('slack '.length, text.length);
        var userRegex = /<@([A-Z|1-9]+.)>/i;
        var channelRegex = /<?#([A-Z0-9]+)(\|\w+>)?/i;
        if (userRegex.test(text)) {
            SLACK.handleMessagePromise(SLACK.slackUserName(text.replace(userRegex, '$1')), message);
        } else if (channelRegex.test(text)) {
            var key = text.replace(channelRegex, '$1');
            SLACK.handleMessagePromise(SLACK.slackChannelInfo(key), message);
        } else if (keyMessage(text, 'list users ')) {
            SLACK.handleMessagePromise(SLACK.slackTeamList(), message);
        } else if (keyMessage(text, 'whoami ')) {
            SLACK.handleMessagePromise(SLACK.slackWhoAmI(), message);
        } else if (keyMessage(text, 'whos online ')) {
            SLACK.handleMessagePromise(SLACK.slackWhoseOnline(), message);
        } else if (keyMessage(text, 'debug ')) {
            SLACK.sendMessage("Debug: "+JSON.stringify(message), message);
        } else {
            SLACK.sendMessage("Slack command does not exist", message);
        }
    } else if (keyMessage(text, 'git ')) {
        SLACK.handleMessagePromise(GIT.auth(pass), message);
        text = text.substring('git '.length, text.length);
            if (keyMessage(text, 'branches')) {
                SLACK.handleMessagePromise(GIT.checkNumberofFeatureBranches(), message);
            }else if (keyMessage(text, 'list branches')) {
                SLACK.handleMessagePromise(GIT.listBranches(), message);
            }else if (keyMessage(text, 'pushed')){
                text = text.substring('pushed '.length, text.length);
                SLACK.handleMessagePromise(GIT.checkLastPushedtoBranchName(text), message);
            }else if (keyMessage(text, 'open pull')){
                SLACK.handleMessagePromise(GIT.checkLatestPullRequest(), message);
            }else if (keyMessage(text, 'closed pull')){
                SLACK.handleMessagePromise(GIT.checkLatestClosedPullRequest(), message);
            }else if (keyMessage(text, 'time')){
                text = text.substring('time '.length, text.length);
			     SLACK.handleMessagePromise(GIT.checkLatestBranchUpdatgeTime(text), message);	
			}else if (keyMessage(text, 'contributors')){
			     SLACK.handleMessagePromise(GIT.checkContributors(), message);
			}else if (keyMessage(text, 'repos')) {
				 text = text.substring('repos '.length, text.length);
				 SLACK.handleMessagePromise(GIT.getRepos(text), message);	 
			}else if (keyMessage(text, 'get all pull requests')){
			     SLACK.handleMessagePromise(GIT.getAllPullRequests(), message);
			}else if (keyMessage(text, 'merge pull request')){
			     text = text.substring('merge pull request '.length, text.length);
				 SLACK.handleMessagePromise(GIT.mergePullRequest(text), message);
			}else if (keyMessage(text, 'feeds')){
                SLACK.handleMessagePromise(GIT.feeds(), message);
            }else if (keyMessage(text, 'add repo ')){
			     text = text.substring('add repo '.length, text.length);
                message.text = text;
				 SLACK.handleMessagePromise(GIT.addRepo(message), message);

			}else if (keyMessage(text, '-testrepo ')){
			     text = text.substring('-testrepo '.length, text.length);
				 SLACK.handleMessagePromise(GIT.repoTest(text), message);
			}else {
				SLACK.sendMessage("Git Command does not exist", message);
			}
    }else if (keyMessage(text, 'help ')) {
        SLACK.handleMessagePromise(getActiveCommands(), message);
    }
    //SAMPLE CONVERSATION CONSTRUCT
    else if (keyMessage(text, 'wait ')) {
        text = text.substring('wait '.length, text.length);
        if(text.length == 0){
            SLACK.startConversation("wait -1 ",message);
            SLACK.sendMessage("I'm Listening for another command", message);
        }else if (keyMessage(text, '-1 ')){
            text = text.substring('-1 '.length, text.length);
            console.log(text);
                if(keyMessage(text,'sample command ')){
                    SLACK.sendMessage("This is a command accessed by conversation", message);
                }else{
                    SLACK.sendMessage("Try using `wait`, then `sample command` :wink: :wink:", message);
                }
            }
    } else {
        SLACK.sendMessage("I'm sorry, this isn't a command I'm familiar with. use `help` command for list of commands", message);
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

getActiveCommands = function(){
    if (exports.DEBUG) {console.log('getActiveCommands called.')}
    return new Promise (function(fulfill,reject) {
        fulfill(`Here are my Current Commands:

aws (Cloud - Amazon Web Services)
\tcheck ec2 [instance]
\tcheck number of instances
\tget cost of [instance]

git (GitHub)
\tbranches
\tlist branches
\tpushed [branch-name]
\topen pull
\tclosed pull
\ttime [branch-name]
\tcontributors
\trepos
\tget all pull requests
\tmerge pull request [pull request number]
\tfeeds

slack
\t#(Channel Name)
\t@(Username)
\twhoami
\twhos online
\tlist users
\twait
`);
    });
}
