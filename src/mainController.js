const AWS = require('./AWS_API.js');
const GIT = require('./GITHUB_API.js');
const SLACK = require('./SlackInterface.js');
const DEBUG = module.exports.DEBUG;
AWS.DEBUG = DEBUG;

//Main Controller Code

exports.parseCommand = function(message) {
    var text = message.text;
     if (DEBUG) { console.log("Parsing Command: "+text)}
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
			}else {
				SLACK.sendMessage("Git Command does not exist", message);
			}
    }else if (keyMessage(text, 'help ')) {
    	//Help documentation.
    	text = text.substring('help '.length, text.length);
    	if (keyMessage(text, 'aws ')){
    		text = text.substring('aws '.length, text.length);
    		if(keyMessage(text, 'check ec2 ')){
    			SLACK.sendMessage("The 'aws check ec2 [instance]' command checks the status of a given ec2 instance.", message);
    		}
    		else if(keyMessage(text, 'check number of instances ')){
    			SLACK.sendMessage("The 'aws check number of instances' command checks the total number of ec2 instances and the number currently running.", message);
    		}
    		else{
    			SLACK.sendMessage("The AWS (Amazon Web Services) commands I currently know are:\n \
    					\tcheck ec2 [instance] \n \
    					\tcheck number of instances \n", message);
    		}
    	}
    	else if (keyMessage(text, 'git ')){
    		text = text.substring('git '.length, text.length);
			if (keyMessage(text, 'branches')) {
				SLACK.sendMessage("The 'git branches' command checks the number of branches active in the current repository.", message);
			}else if (keyMessage(text, 'list branches')) {
				SLACK.sendMessage("The 'git list branches' command lists the names of the branches in the current repository.", message);
			}else if (keyMessage(text, 'pushed')){
				SLACK.sendMessage("Help for this command doesn't exist yet. Sorry!", message);
			}else if (keyMessage(text, 'open pull')){
				SLACK.sendMessage("Help for this command doesn't exist yet. Sorry!", message);
			}else if (keyMessage(text, 'closed pull')){
				SLACK.sendMessage("Help for this command doesn't exist yet. Sorry!", message);
			}else if (keyMessage(text, 'time')){
				SLACK.sendMessage("Help for this command doesn't exist yet. Sorry!", message);
			}else if (keyMessage(text, 'contributors')){
				SLACK.sendMessage("Help for this command doesn't exist yet. Sorry!", message);
			}
    		else{
    			SLACK.sendMessage("The Git (GitHub) commands I currently have help documents for are:\n\
    					\tbranches\n\
    					\tlist branches \n\
    					\tpushed [branch-name]\n\
    					\topen pull \n\
    					\tclosed pull \n\
    					\ttime [branch-name]\n\
    					\tcontributors\n", message);
    		}
    	}
    	else if (keyMessage(text, 'slack ')){
    		text = text.substring('slack '.length, text.length);
            if (keyMessage(text, '# ')) {
            	SLACK.sendMessage("The command 'slack #[channel name]' displays information about the requested channel.", message);
            } else if (keyMessage(text, '@ ')) {
            	SLACK.sendMessage("The command 'slack @[user name]' displays information about the requested user.", message);
            } else if (keyMessage(text, 'list users ')) {
            	SLACK.sendMessage("The 'slack list users' lists the users currently on the team.", message);
            } else if (keyMessage(text, 'whoami ')) {
            	SLACK.sendMessage("The 'slack whoami' command prints the bot's information on the current team.", message);
            } else if (keyMessage(text, 'whos online ')) {
            	SLACK.sendMessage("The 'slack whos online' command lists the team members currently online.", message);
            } else if (keyMessage(text, 'wait ')) {
            	SLACK.sendMessage("Help for this command doesn't exist yet. Sorry!", message);
            }
    		else{
    			SLACK.sendMessage("The Slack  commands I currently have help documents for are:\n\
    					\t#(Channel Name)\n\
    					\t@(Username)\n\
    					\twhoami\n\
    					\twhos online\n\
    					\tlist users\n\
    					\twait\n", message);
    		}
    	}
    	else{
    		SLACK.handleMessagePromise(getActiveCommands(), message);
    	}
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
	return new Promise (function(fulfill,reject){
		
			fulfill("Here are my Current Commands:\n\n \
aws (Cloud - Amazon Web Services) \n \
\tcheck ec2 [instance] \n \
\tcheck number of instances \n \
\n \
git (GitHub) \n\
\tbranches\n\
\tlist branches \n\
\tpushed [branch-name]\n\
\topen pull \n\
\tclosed pull \n\
\ttime [branch-name]\n\
\tcontributors\n\
\n\
slack \n\
\t#(Channel Name)\n\
\t@(Username)\n\
\twhoami\n\
\twhos online\n\
\tlist users\n\
\twait\n\n\
For information on a command, type 'help' plus the name of the command.\n");
                    
        
            
    });
 }