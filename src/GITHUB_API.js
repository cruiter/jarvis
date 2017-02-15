/**
 * This is a library of GitHub_API calls for Jarvis
 */
var GitHubApi = require("github");

var github = new GitHubApi({
    // optional may be using for future use oAuath	1`
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

function getNumberofFeatureBranches(owner , repo){
	github.repos.getBranches({ 
		owner: owner ,
		repo: repo
	},function(err, res) {
		var count = 0
		for (var item in res) {
			count++;
		}
		console.log(count - 1); // -1 to account for master branch 
	});
}

function getLastPushedtoBranch(owner, repo, branch){
	github.repos.getBranch({ 
		owner: owner,
		repo: repo,
		branch: branch
	},function(err, res) {
		console.log(JSON.stringify(res.commit.commit.author.name));
	});
}

function getLatestPullRequest(owner, repo){
github.pullRequests.getAll({ 
 owner: owner ,
 repo: repo,
 state: "open"
 },function(err, res) {

	num = 1;
	console.log(JSON.stringify(res[0].title));
 });
 
}


function getLastClosedPullRequest ( owner, repo){
 github.pullRequests.getAll({ 
 owner: owner ,
 repo: repo,
 state: "closed"
 },function(err, res) {

	num = 1;
	console.log(JSON.stringify(res[0].title));
 });
}

function getLastBranchChangeTime(owner , repo , branch){
 github.repos.getBranch({ 
 owner: owner ,
 repo: repo,
 branch: branch
 },function(err, res) {

	
	//console.log(JSON.stringify(res.commit.commit.author.date));
	JSON.stringify(res.commit.commit.author.date);
 });
 }
  
function getContributors(owner, repo){
 github.repos.getContributors({ 
 owner : owner,
 repo : repo
 },function(err, res) {

	for (var item in res) {
	if ((JSON.stringify(res[item].login)) == null)
	{   }
	
	else console.log(JSON.stringify(res[item].login));
	  
	  }
	//console.log(JSON.stringify(res));
 });
 }

 getLastBranchChangeTime("jessicalynn", "jarvis", "45-GitHub", function(id) {
    console.log(id);    
});

getLastBranchChangeTime("jessicalynn", "jarvis", "45-GitHub", function(response){
    // Here you have access to your variable
    console.log(response);
});
 
getLastPushedtoBranch("jessicalynn","jarvis", "45-GitHub");
getNumberofFeatureBranches("jessicalynn", "jarvis");
getLastClosedPullRequest("jessicalynn", "jarvis");
var output = getLastBranchChangeTime("jessicalynn","jarvis","45-GitHub")
console.log(output);
getContributors("jessicalynn","jarvis");
getLatestPullRequest("jessicalynn","jarvis");
