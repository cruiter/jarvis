/**
 * This is a library of GitHub_API calls for Jarvis
 */
var GitHubApi = require("github");
var dateformat = require("dateformat");

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

//github.authenticate({
 //   type: "oauth",
 //   key: "ffa9b5a00b7deea280ac",
 //   secret: "5875604c29f07a887e99143aee8d111d52e2c78c"

//})

github.authenticate({
    type: "basic",
    username: "vbhagat",
    password: "Clubhouse1"
}, function (err,data){
	if (err){
		console.log(err);
	}
	if (data){
		console.log(data);
	}
});


var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';

function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}
 
function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}
 
var hw = encrypt("Clubhouse1")
// outputs hello world
console.log((hw));
console.log(decrypt(hw));


//github.pullRequests.merge({ ... });

//github.authorization.getOrCreateAuthorizationForApp({client_secret:"5875604c29f07a887e99143aee8d111d52e2c78c" }, function(err,data){
//	if (err) {
//		  console.log(err)
//		return (err);
//	}
//	if (data){
//		console.log(data);
//		return (data);
//	}
//	});
	
/*	github.authorization.check({client_secret:"5875604c29f07a887e99143aee8d111d52e2c78c",client_id:"ffa9b5a00b7deea280ac" }, function(err,data){
	if (err) {
  console.log(err)	
	return (err);
	}
	if (data){
		console.log(data);
		return (data);
	}
	});
	
	github.authorization.getAll({ }, function(err,data){
	if (err) {
		  console.log(err)
		return (err);
	}
	if (data){
		console.log(data);
		return (data);
	}
	});
	
	github.authorization.create({
  client_secret:"5875604c29f07a887e99143aee8d111d52e2c78c",
  client_id:"ffa9b5a00b7deea280ac"
}, function(err, res) {
    if (err) {
        console.log(err)
		//save and use res.token as in the Oauth process above from now on
    }
});
	

*/

exports.checkNumberofFeatureBranches = function() {
    if (exports.DEBUG) { console.log('checkNumberofFeatureBranches called.') }
    return new Promise(function(fulfill, reject) {
        github.repos.getBranches({owner:"jessicalynn",repo:"jarvis"}, function(err, data) {
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
        github.repos.getBranches({owner:"jessicalynn",repo:"jarvis"}, function(err, data) {
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
        github.repos.getBranch({ owner: "jessicalynn", repo: "jarvis" ,branch: qBranch},function(err, data) {
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
        github.pullRequests.getAll({ owner: "jessicalynn" , repo: "jarvis" ,state: "open"},function(err, data) {
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

exports.checkLatestPullRequest();
exports.checkLatestClosedPullRequest = function(){
    if (exports.DEBUG) {console.log('checkLatestClosedPullRequest called.')}
    return new Promise (function(fulfill,reject){
        github.pullRequests.getAll({ owner: "jessicalynn" , repo: "jarvis", state: "closed"},function(err, data) {
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

github.pullRequests.getAll({ owner: "jessicalynn" , repo: "jarvis" },function(err, data) {
            if (err){
               console.log(err);
            }
            data = data.data;
            if (data) {
                console.log("here")
				console.log(data);
            }
        });


exports.checkLatestBranchUpdatgeTime = function(qBranch){
    if (exports.DEBUG) {console.log('checkLatestBranchUpdatgeTime called.')}
    if(!qBranch || qBranch == ""){
        qBranch = "master";
    }
    return new Promise (function(fulfill,reject){
        github.repos.getBranch({ owner: "jessicalynn" , repo: "jarvis", branch: qBranch},function(err, data) {
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
        github.repos.getContributors({  owner : "jessicalynn", repo : "jarvis"},function(err, data) {
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
