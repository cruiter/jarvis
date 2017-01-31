/**
 * This is a library of AWS_API calls for Jarvis
 */

var AWS = require('aws-sdk');
var EC2 = new AWS.EC2({apiVersion: '2016-11-15',region: 'us-west-2'})


exports.checkEC2Instance = function(instanceId, callback) {
    var params = {
        InstanceIds: [ instanceId ]
    }
    EC2.describeInstances(params, function(err, data) {
        if (err) {
            console.log(err, err.stack);
            return;
        }

        //console.log(JSON.stringify(data, null, 2));
        callback(data.Reservations[0].Instances[0].State.Name === 'running');
    });
}