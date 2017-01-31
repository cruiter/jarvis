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
            return console.err(err, err.stack);
        }

        //console.log(JSON.stringify(data, null, 2));
        callback(data.Reservations[0].Instances[0].State.Name === 'running');
    });
}

exports.checkEC2 = function(callback) {
    //query for the status of all instances
    EC2.describeInstances({}, function(err, data) {
        if (err) {
            return console.err(err, err.stack);
        }

        var instances = data.Reservations[0].Instances;
        var nonRunningInstances = [];

        //look for all of the instances that are not running
        for (var i = instances.length - 1; i >= 0; i--) {
            if (instances[i].State.Name !== 'running') {
                nonRunningInstances.push(instances[i].InstanceId);
            }
        }

        // nonRunningInstances.push('i-6634291699');
        // nonRunningInstances.push('i-128397357');
        // nonRunningInstances.push('i-2725972359');

        if (nonRunningInstances.length < 1) {
            callback('Everything is running. All good!');
        } else {
            var message = 'The instances: ';
            for (var i = nonRunningInstances.length - 1; i >= 0; i--) {
                message += nonRunningInstances[i] + ', ';
            }
            message = message.substring(0, message.length - 2);
            message += ' are not running right now. Check them out!';

            callback(message);
        }
    });
}