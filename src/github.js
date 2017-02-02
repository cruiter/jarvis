var GitHubApi = require("github");

var github = new GitHubApi({
    // optional
    debug: true,
    protocol: "http",
    host: "api.github", // should be api.github.com for GitHub
    pathPrefix: "/api/v3", // for some GHEs; none for GitHub
    headers: {
        "user-agent": "Jarvis" // GitHub is happy with a unique user agent
    },
    Promise: require('bluebird'),
    followRedirects: false, // default: true; there's currently an issue with non-get redirects, so allow ability to disable follow-redirects
    timeout: 5000
});

// TODO: optional authentication here depending on desired endpoints. See below in README.

github.users.getFollowingForUser({
    // optional
    // headers: {
    //     "cookie": "blahblah"
    // },
    username: "vbhagat"
}, function(err, res) {
    console.log(JSON.stringify(res));
});