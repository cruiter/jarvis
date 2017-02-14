/**
 * This is a library of AWS_API calls for Jarvis
 */

var AWS = require('aws-sdk');
var EC2 = new AWS.EC2({apiVersion: '2016-11-15',region: 'us-west-2'})
var PING = require('ping');


/**
 * Checks the status of a specific EC2 Instance
 * @param  {String} instanceId the resource ID
 * @return {Promise}
 */
exports.checkEC2Instance = function(instanceId) {
    if (exports.DEBUG) { console.log('checkEC2Instance called.') }

    return new Promise(function(fulfill, reject) {
        var params = {
            InstanceIds: [ instanceId ]
        }
        EC2.describeInstances(params, function(err, data) {
            if (err) {
                return reject(err);
            }
            var nonRunningInstances = [];
            var blockingPromises = [];

            if (data.Reservations[0].Instances[0].State.Name === 'running') {
                var pingPromise = pingCheck(data.Reservations[0].Instances[0], nonRunningInstances);
                blockingPromises.push(pingPromise);
            }

            Promise.all(blockingPromises).then(function () {
                if (nonRunningInstances.length > 0) {
                    fulfill('Looks like ' + instanceId + ' has a problem. Better check it out.');
                } else {
                    fulfill('The instance ' + instanceId + ' looks good!');
                }
            });
        });
    });
}

/**
 * Checks the instance to see if it is pingable
 * @param  {Object} instance            instance to check
 * @param  {List} nonRunningInstances   List to append nonAlive instances to
 * @return {Promise}
 */
var pingCheck = function(instance, nonRunningInstances) {
    return new Promise(function(fulfill) {
        // see if the public ip address is not available
        if (instance.PublicIpAddress === undefined ||
            instance.PublicIpAddress === null ||
            instance.PublicIpAddress === '') {
            return fulfill();
        }

        PING.promise.probe(instance.PublicIpAddress)
        .then(function (response) {
            // if there is a problem pinging...
            if (!response.alive) {
                nonRunningInstances.push(instance.InstanceId);
            }
            fulfill();
        });
    });
}

/**
 * Checks the status of all of the EC2 Instances
 * @return {Promise}
 */
exports.checkEC2 = function() {
    if (exports.DEBUG) { console.log('checkEC2 called.') }

    return new Promise(function(fulfill, reject) {
        //query for the status of all instances
        EC2.describeInstances({}, function(err, data) {
            if (err) {
                return reject(err);
            }

            var instances = data.Reservations[0].Instances;
            instances.push({'InstanceId': 'localhost', 'PublicIpAddress': '127.0.0.1', 'State': {'Name': 'running'}});
            var nonRunningInstances = [];
            var blockingPromises = [];

            //look for all of the instances that are not running
            for (var i = instances.length - 1; i >= 0; i--) {
                if (instances[i].State.Name !== 'running') {
                    nonRunningInstances.push(instances[i].InstanceId);
                } else {
                    var pingPromise = pingCheck(instances[i], nonRunningInstances);
                    blockingPromises.push(pingPromise);
                }
            }

            Promise.all(blockingPromises).then(function () {
                if (nonRunningInstances.length < 1) {
                    fulfill('Everything is running. All good!');
                } else {
                    var message = 'The instances: ';
                    for (var i = nonRunningInstances.length - 1; i >= 0; i--) {
                        message += nonRunningInstances[i] + ', ';
                    }
                    //remove the trailing comma and space
                    message = message.substring(0, message.length - 2);
                    message += ' are not running right. Check them out!';

                    fulfill(message);
                }
            });
        });
    });
}

/**
 * Checks the number of existing instances
 * @return {Promise}
 */
exports.checkNumInstances = function () {
    if (exports.DEBUG) { console.log('checkNumInstances called.') }

    return new Promise(function(fulfill, reject) {
        EC2.describeInstances({}, function(err, data) {
            if (err) {
                return reject(err);
            }

            var instances = data.Reservations[0].Instances;
            var resp = '';
            var num = 0;

            if (instances.length === 1) {
                resp += 'There is 1 instance.\n';
            } else {
                resp += 'There are ' + instances.length + ' instances.\n';
            }
            for (var i = instances.length - 1; i >= 0; i--) {
                if (instances[i].State.Name === 'running') {
                    num++;
                }
            }
            if (num === 1) {
                resp += '1 instance is running.'
            } else {
                resp += '' + num + ' instances, are running.';
            }

            fulfill(resp);
        });
    });
}