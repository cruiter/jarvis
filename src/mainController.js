//Main Controller Code
exports.getActiveCommands = function(){
	if (exports.DEBUG) {console.log('getActiveCommands called.')}
	return new Promise (function(fulfill,reject){
		
			fulfill("Here are my Current Commands:\n\n \
aws (Cloud - Amazon Web Services) \n \
\tcheck ec2 [instance] \n \
\tcheck number of instances \n \
\n \
git (GitHub) \n\
\tbranches \n\
\topen pull \n\
\tclosed pull \n\
\ttime\n\
\tcontributors\n\
\n\
slack \n\
\t#(Channel Name)\n\
\t@(Username)");
            
    });
 }