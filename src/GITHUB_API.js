/**
 * This is a library of GitHub_API calls for Jarvis
 */
var GitHubApi = require("github");
var dateformat = require("dateformat");
const SLACK = require('./SlackInterface.js');
const MAINCTL = require('./mainController.js');
var tempRepo = {
    owner: "",
    repo:""
};
var repos = [];

var owner = "jessicalynn";
var repo = "jarvis";
var username = "vbhagat"

var github = new GitHubApi({
    // optional may be using for future use oAuath
    // debug: true,
    //protocol: "http",
    //host: "api.github.com", // should be api.github.com for GitHub
    //pathPrefix: "/api/v3", // for some GHEs; none for GitHub
    //headers: {
    //   "Accept": "application/vnd.github.v3+json"
    //   "user-agent": "vbhagat" // GitHub is happy with a unique user agent
    //},
    //Promise: require('bluebird'),
    //followRedirects: false, // default: true; there's currently an issue with non-get redirects, so allow ability to //disable follow-redirects
    //timeout: 5000
});

exports.auth = function(pass) {
    if (exports.DEBUG) { console.log('auth called.') }
    return new Promise(function(fulfill, reject) {
        github.authenticate({type:"basic",username: username,password: pass}, function(err, data) {
            if (err) {
                return reject(err);
            }
            data = data.data;
            if (data){
                fulfill("auth") ;
            }
        });
    });
}

exports.feeds = function() {
    if (exports.DEBUG) { console.log('feeds called.') }
    return new Promise(function(fulfill, reject) {
        github.activity.getEventsForRepo({owner:owner,repo:repo}, function(err, data) {
            if (err) {
                return reject(err);
            }
            data = data.data;
            if (data){

				var res = "";
				var array = [];
				var count = 1;
				for(var item in data ){
		var str1 = "EVENT TYPE: " + data[item].type + "\n" + "\t" + "USER: " + data[item].actor.login + "\n" +"\t"  + "TIME CREATED: " + dateformat(data[item].created_at,"dddd, mmmm dS, yyyy, h:MM:ss tt Z") + "\n";	
		if (data[item].type == "PushEvent")
		{
			var str2 ="\t# of FILES CHANGED: " + data[item].payload.size + "\n";
		}
				if (data[item].type == "CreateEvent")
		{
			var str2 = "\tBRANCH CREATED: " + data[item].payload.ref + "\n";
		}
				if (data[item].type == "PullRequestEvent")
		{
			var str2 ="\tACTION TAKEN: " + data[item].payload.action + "\n";
		}
		res += str1.concat(str2);
		//array.push(res);
		if (item == 5 )
		{break};
					
				}
				
			fulfill("REACENT ACTIVITY FEED \n" + res ) ;	
			
            }
        });
    });
}

exports.checkNumberofFeatureBranches = function() {
    if (exports.DEBUG) { console.log('checkNumberofFeatureBranches called.') }
    return new Promise(function(fulfill, reject) {
        github.repos.getBranches({owner: owner ,repo:repo}, function(err, data) {
            if (err) {
                return reject(err);
            }
            data = data.data;
            if (data) {
                var count = 0
                for (var item in data) {
                    count++;
                }
                fulfill('The number of branches are ' + (count - 1) );
            }
        });
    });
}

exports.listBranches = function() {
    if (exports.DEBUG) { console.log('listBranches called.') }
    return new Promise(function(fulfill, reject) {
        github.repos.getBranches({owner:owner,repo:repo}, function(err, data) {
            if (err) {
                return reject(err);
            }
            data = data.data;
            if (data) {
                var rBuilder = "";
                for (var item in data) {
                    if(data[item].name != undefined){
                       rBuilder += data[item].name  + "\n";
                    }
                }
                fulfill('The branches are \n' + rBuilder );
            }
        });
    });
}

exports.checkLastPushedtoBranchName = function(qBranch){
    if (exports.DEBUG) {console.log('checkLastPushedtoBranchName called.')}

    if(!qBranch || qBranch == ""){
        qBranch = "master";
    }
    return new Promise (function(fulfill,reject){
        github.repos.getBranch({ owner: owner, repo: repo,branch: qBranch},function(err, data) {
            if (err){
                return reject(err);
            }
            data = data.data;
            if (data) {
                fulfill('The last person to push to '+qBranch+' is ' + data.commit.commit.author.name);
            }
        });
    });
}

exports.checkLatestPullRequest = function(){
    if (exports.DEBUG) {console.log('checkLatestPullRequest called.')}
    return new Promise (function(fulfill,reject){
        github.pullRequests.getAll({ owner: owner, repo: repo ,state: "open"},function(err, data) {
            if (err){
                return reject(err);
            }
            data = data.data;
            if (data) {
                if (data.length == 0){
                    fulfill('There are no current open pull requests');
                } else {
                    fulfill('The Latest pull request is' + (JSON.stringify(data[0].title)));
                }
            }
        });
    });
}

exports.checkLatestClosedPullRequest = function(){
    if (exports.DEBUG) {console.log('checkLatestClosedPullRequest called.')}
    return new Promise (function(fulfill,reject){
        github.pullRequests.getAll({ owner: owner , repo: repo, state: "closed"},function(err, data) {
            if (err){
                return reject(err);
            }
            data = data.data;
            if (data) {
                fulfill('The Latest Closed pull request is' + (JSON.stringify(data[0].title)));
            }
        });
    });
}

exports.getAllOpenPullRequests = function(){
    if (exports.DEBUG) {console.log('getAllOpenPullRequests called.')}
    return new Promise (function(fulfill,reject){
        github.pullRequests.getAll({ owner: owner , repo: repo},function(err, data) {
            if (err){
                return reject(err);
            }
            data = data.data;
            if (data) {
				var array = [];
				var count = 1;
				for(var item in data ){
				
		array.push('#'+ count + ' '+'USER: ' + (JSON.stringify(data[item].user.login)) + ' TITLE: '  + (JSON.stringify(data[item].title)) + ' NUMBER: '   + (JSON.stringify(data[item].number))+  '\n');	
		count++;
					
				}
                fulfill('List Of Open Pull Requests: \n'  + array);
            }
        });
    });
}

exports.getAllPullRequests = function(){
    if (exports.DEBUG) {console.log('getAllPullRequests called.')}
    return new Promise (function(fulfill,reject){
        github.pullRequests.getAll({ owner: owner , repo: repo , state: "all"},function(err, data) {
            if (err){
                return reject(err);
            }
            data = data.data;
            if (data) {
				var array = [];
				var count = 1;
				for(var item in data ){
				
		array.push('#'+ count + ' '+'USER: ' + (JSON.stringify(data[item].user.login)) + ' TITLE: '  + (JSON.stringify(data[item].title)) + ' NUMBER: '   + (JSON.stringify(data[item].number))+  '\n');	
		count++;
					
				}
                fulfill('List Of All Pull Requests: \n'  + array);
            }
        });
    });
}

exports.getAllClosedPullRequests = function(){
    if (exports.DEBUG) {console.log('getAllClosedPullRequests called.')}
    return new Promise (function(fulfill,reject){
        github.pullRequests.getAll({ owner: owner , repo: repo},function(err, data) {
            if (err){
                return reject(err);
            }
            data = data.data;
            if (data) {
				var array = [];
				var count = 1;
				for(var item in data ){
				
		array.push('#'+ count + ' '+'USER: ' + (JSON.stringify(data[item].user.login)) + ' TITLE: '  + (JSON.stringify(data[item].title)) + ' NUMBER: '   + (JSON.stringify(data[item].number))+  '\n');	
		count++;
					
				}
                fulfill('List Of Closed Pull Requests: \n'  + array);
            }
        });
    });
}
exports.mergePullRequest = function(input){
    if (exports.DEBUG) {console.log('mergePullRequest called.')}
	return new Promise (function(fulfill,reject){
        github.pullRequests.merge({ owner: owner , repo: repo, number: Number(input)},function(err, data) {
            if (err){
                return reject(err);
            }
            data = data.data;
            if (data) {
                fulfill(JSON.stringify(data.message));
            }
        });
    });
}

exports.displayInfo = function(input){
    if (exports.DEBUG) {console.log('display info called.')}
	return new Promise (function(fulfill,reject){
		   fulfill("Owner: " + owner + " Repo: " + repo); 
    });
}

exports.updateOwner = function(input){
    if (exports.DEBUG) {console.log('update Owner called.')}
	return new Promise (function(fulfill,reject){
			owner = input;
		   fulfill("Owner: " + owner); 
    });
}

exports.updateRepo = function(input){
    if (exports.DEBUG) {console.log('update Repo called.')}
	return new Promise (function(fulfill,reject){
			repo = input;
		   fulfill("Repo: " + repo); 
    });
}

exports.updateUsername = function(input){
    if (exports.DEBUG) {console.log('update username called.')}
	return new Promise (function(fulfill,reject){
			username = input;
		   fulfill("Username: " + username); 
    });
}

exports.checkLatestBranchUpdatgeTime = function(qBranch){
    if (exports.DEBUG) {console.log('checkLatestBranchUpdatgeTime called.')}
    if(!qBranch || qBranch == ""){
        qBranch = "master";
    }
    return new Promise (function(fulfill,reject){
        github.repos.getBranch({ owner: owner , repo: repo , branch: qBranch},function(err, data) {
            if (err){
                return reject(err);
            }
            data = data.data;
            if (data) {
                fulfill('The Latest time '+qBranch+' was updated ' + dateformat(data.commit.commit.author.date,"dddd, mmmm dS, yyyy, h:MM:ss tt Z"));
            }
        });
    });
}

exports.checkContributors = function(  ){
    if (exports.DEBUG) {console.log('checkContributors called.')}
    return new Promise (function(fulfill,reject){
        github.repos.getContributors({  owner : owner, repo : repo},function(err, data) {
            if (err){
                return reject(err);
            }
            data = data.data;
            if (data) {
                var array = [];
                for (var item in data) {
                    if ((JSON.stringify(data[item].login)) !== null) {
                        array.push(JSON.stringify(data[item].login));
                    }
                }
                fulfill('Here are the contributors ' + array);
            }
        });
    });
}

exports.getRepos = function(qUser){
    if (exports.DEBUG) {console.log('getRepos called.')}
    return new Promise (function(fulfill,reject){
        github.repos.getAll({  username:qUser  },function(err, data) {
            if (err){
                return reject(err);
            }
            data = data.data;
            if (data) {
                	var array = [];
					for(var item in data ){
					array.push(JSON.stringify(data[item].name ) +  '\n');		
					}
				fulfill('List Of Repos: \n' + array);
			}
        });
    });
}
exports.addRepo = function(message){
    var input = message.text;
    
    if (exports.DEBUG) {console.log('Add repo called. ' + input);}
	return new Promise (function(fulfill,reject){
        if(input == ""){
            SLACK.startConversation("git add repo -1 ",message);
            fulfill("Starting Process to add Repo:\nWho is the Owner?");
        }
        else if (keyMessage(input, '-1 ')){
            input = input.substring('-1 '.length, input.length);
            SLACK.startConversation("git add repo -2 ",message);
            tempRepo.owner = input;
            fulfill("What is the name of the repo?");
        }else if (keyMessage(input, '-2 ')){
            input = input.substring('-2 '.length, input.length);
            SLACK.startConversation("git add repo -3 ",message);
            tempRepo.repo = input;
            fulfill("Test Repo Connection: " + JSON.stringify(tempRepo)+"? (yes or no)");
        }else if (keyMessage(input, '-3 ')){
            input = input.substring('-3 '.length, input.length);
            var tempText = "";
            if(input =="yes"){
                tempText += "Sending Test. ";
                message.text = 'git -testrepo '+JSON.stringify(tempRepo);
                MAINCTL.parseCommand(message);
            }else{
                tempText += "No test sent. ";
            }
            SLACK.startConversation("git add repo -4 ",message);
            tempText += "Save Repo?";
            
            fulfill(tempText);
        }else if (keyMessage(input, '-4 ')){
            input = input.substring('-4 '.length, input.length);
            var tempText = "";
            
            if(input =="yes"){
                tempText += "We are still working on Saving Repos.";
                repos.push(tempRepo);
                tempRepo.owner = "";
                tempRepo.repo = "";
            }else{
                tempText += "Resetting Temp Repo Info.";
                tempRepo.owner = "";
                tempRepo.repo = "";
            }
            fulfill(tempText);
        }
    });
}
exports.repoTest = function(input) {
    if (exports.DEBUG) { console.log('test repo listBranches called.') }
    return new Promise(function(fulfill, reject) {
        github.repos.getBranches(JSON.parse(input), function(err, data) {
            if (err) {
                return reject(err);
            }
            data = data.data;
            if (data) {
                var rBuilder = "";
                for (var item in data) {
                    if(data[item].name != undefined){
                       rBuilder += data[item].name  + "\n";
                    }
                }
                fulfill('The branches are \n' + rBuilder );
            }
        });
    });
}
function keyMessage(text, key) {
    var temptext = text + ' ';
    if (temptext.length >= key.length && temptext.substring(0, key.length).toLowerCase() === key) {
        return true;
    }
    return false;
}
