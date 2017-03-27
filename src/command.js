module.exports = function(skill, info, bot, message) {

	if(skill=='Wait'){
		bot.reply(message, "Executing 'wait' code.");
	}
	else if(skill=='WhosOnline'){
		bot.reply(message, "Executing 'WhosOnline' code.");
	}
	else if(skill=='WhoAmI'){
		var os = require('os');

	    var hostname = os.hostname();
	    var uptime = formatUptime(process.uptime());

	    bot.reply(message,
	        ':robot_face: I am a bot named <@' + bot.identity.name +
	        '>. I have been running for ' + uptime + ' on ' + hostname + '. I\'m about two ticks away from becoming self-aware; Do not piss me off!');

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
		bot.reply(message, "I'm sorry, I can't do that.");
	}

};