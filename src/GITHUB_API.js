/**
 * This is a library of GitHub_API calls for Jarvis
 */
var GitHubApi = require("github");

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

var greetings = require("./GitHub_API.js");

exports.checkNumberofFeatureBranches = function(owner , repo) {
    if (exports.DEBUG) { console.log('checkNumberofFeatureBranches called.') }
    return new Promise(function(fulfill, reject) {
        github.repos.getBranches({owner:"jessicalynn",repo:"jarvis"}, function(err, data) {
            if (err) {
                return reject(err);
            }
            if (data) {
                var count = 0
					for (var item in data) {
					count++;
					}
			console.log(count - 1); // -1 to account for master branch 
			fulfill('The number is ' + count - 1 );
            } 
        });
    });
}
//greetings.checkNumberofFeatureBranches();

	
exports.checkLastPushedtoBranchName = function( owner, repo , branch){
	if (exports.DEBUG) {console.log('checkLastPushedtoBranchName called.')}
	return new Promise (function(fulfill,reject){
		github.repos.getBranch({ owner: "jessicalynn", repo: "jarvis" ,branch: "45-GitHub"},function(err, data) {
		if (err){
			return reject(err);
		}
		if (data) {
			console.log(JSON.stringify(data.commit.commit.author.name));
			fulfill('The last person to push to branch is ' + (JSON.stringify(data.commit.commit.author.name)));
		}

	});
});
}

//greetings.checkLastPushedtoBranchName();

exports.checkLatestPullRequest = function( owner, repo ){
	if (exports.DEBUG) {console.log('checkLatestPullRequest called.')}
	return new Promise (function(fulfill,reject){
		github.pullRequests.getAll({ owner: "jessicalynn" , repo: "jarvis" ,state: "open"},function(err, data) {
		if (err){
			return reject(err);
		}
		if (data) {
			console.log(JSON.stringify(data[0].title));
			fulfill('The Latest pull request is' + (JSON.stringify(data[0].title)));
		}	
	});
});
}
//greetings.checkLatestPullRequest();

exports.checkLatestClosedPullRequest = function( owner, repo ){
	if (exports.DEBUG) {console.log('checkLatestClosedPullRequest called.')}
	return new Promise (function(fulfill,reject){
		github.pullRequests.getAll({ owner: "jessicalynn" , repo: "jarvis", state: "closed"},function(err, data) {
		if (err){
			return reject(err);
		}
		if (data) {
			console.log(JSON.stringify(data[0].title));
			fulfill('The Latest Closed pull request is' + (JSON.stringify(data[0].title)));
		}
	});
 });
}

//greetings.checkLatestClosedPullRequest();

exports.checkLatestBranchUpdatgeTime = function( owner, repo ){
	if (exports.DEBUG) {console.log('checkLatestBranchUpdatgeTime called.')}
	return new Promise (function(fulfill,reject){
		github.repos.getBranch({ owner: "jessicalynn" , repo: "jarvis", branch: "45-GitHub"},function(err, data) {
		if (err){
			return reject(err);
		}
		if (data) {
			console.log(JSON.stringify(data.commit.commit.author.date));
			fulfill('The Latest time branch was updated ' + (JSON.stringify(data.commit.commit.author.date)));
		}
	});
});
}
  //greetings.checkLatestBranchUpdatgeTime();

exports.checkContributors = function( owner, repo ){
	if (exports.DEBUG) {console.log('checkContributors called.')}
	return new Promise (function(fulfill,reject){  
		github.repos.getContributors({  owner : "jessicalynn", repo : "jarvis"},function(err, data) {
		if (err){
			return reject(err);
		}
		if (data){
		var array = [];
		for (var item in data) {
			if ((JSON.stringify(data[item].login)) == null)
			{   }
			else {
			array.push(JSON.stringify(data[item].login));
			}
		}
		console.log(array);
		fulfill('Here are the contributors ' + array);
		}
	});
});
}

//greetings.checkContributors();
 
