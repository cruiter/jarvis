const SLACK = require('./SlackInterface.js');

module.exports = function(skill, info, message) {
	console.log("Command file reached!")
	if(skill=='Wait'){
		SLACK.sendMessage("Executing 'wait' code.", message);
	}
	else if(skill=='WhosOnline'){
		SLACK.sendMessage("Executing 'WhosOnline' code.", message);
	}
	else if(skill=='WhoAmI'){
		var os = require('os');

	    var hostname = os.hostname();
	    var uptime = formatUptime(process.uptime());

	    SLACK.sendMessage(
	        ':robot_face: I am a bot named Jarvis. I have been running for ' + uptime + ' on ' + hostname + '. I\'m about two ticks away from becoming self-aware; Do not piss me off!', message);

	function formatUptime(uptime) {
	    var unit = 'second';
	    if (uptime > 60) {
	        uptime = uptime / 60;
	        unit = 'minute';
	    }
	    if (uptime > 60) {
	        uptime = uptime / 60;
	        unit = 'hour';
	    }
	    if (uptime != 1) {
	        unit = unit + 's';
	    }

	    uptime = uptime + ' ' + unit;
	    return uptime;
	}
	}
	else{
		SLACK.sendMessage("I'm sorry, I can't do that.", message);
	}

};