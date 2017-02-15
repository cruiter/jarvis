var GitHubApi = require("github");

var github = new GitHubApi({
    // optional
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

// TODO: optional authentication here depending on desired endpoints. See below in README.

//github.users.getFollowingForUser({
    // optional
    // headers: {
    //     "cookie": "blahblah"
    // },
//    username: "defunkt"
//}, function(err, res) {
//    console.log(JSON.stringify(res));
//});

//github.search.repos({ ... });
//github.search.repos({
    // optional
    // headers: {
    //     "cookie": "blahblah"
    // },
//    q: "jarvis"
//}, function(err, res) {
//    console.log(JSON.stringify(res));
//});

function getfeatures(owner , repo){
github.repos.getBranches({ 
 owner: owner ,
 repo: repo
 },function(err, res) {
      var count = 0
	  for (var item in res) {
	//	console.log(JSON.stringify(res[item]));
	  count++;
	  }
	  console.log(count - 1);
	//console.log(JSON.stringify(res));
 });
}

getfeatures("jessicalynn", "jarvis");

function getLastPushed(owner, repo, branch){
 github.repos.getBranch({ 
 owner: owner,
 repo: repo,
 branch: branch
 },function(err, res) {

	
	console.log(JSON.stringify(res.commit.commit.author.name));
 });
}

getLastPushed("jessicalynn","jarvis", "45-GitHub");


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

getLatestPullRequest("jessicalynn", "jarvis");

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

getLastClosedPullRequest("jessicalynn", "jarvis");
 
 function getLastBranchChangeTime(owner , repo , branch){
 github.repos.getBranch({ 
 owner: owner ,
 repo: repo,
 branch: branch
 },function(err, res) {

	
	console.log(JSON.stringify(res.commit.commit.author.date));
 });
 }
 
 getLastBranchChangeTime("jessicalynn","jarvis","45-GitHub")
 
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
 
 getContributors("jessicalynn","jarvis");
//github.orgs.checkTeamRepo({ 
// id: "",
// owner:"",
// repo:""
 
// },function(err, res) {
//    console.log(JSON.stringify(res));
//});


//github.authenticate({
//    type: "basic",
//    username: vbhagat,
//    password: Clubhouse1
//});