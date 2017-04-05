/**
 * This is a library of AWS_API calls for Jarvis
 */

var AWS = require('aws-sdk');
var EC2 = new AWS.EC2({apiVersion: '2016-11-15',region: 'us-west-2'})
var PING = require('ping');


/**
 * Promise wrapper for EC2 callback functions
 * @param {String} functionName     EC2 function
 * @param {Object} EC2              EC2 instance
 * @param {JSONObject} params       parameters to send
 */
var EC2Promise = function(ec2, functionName, params) {
    return new Promise(function(fulfill, reject) {
        ec2[functionName](params, function(err,data) {
            if (err) {
                reject(err);
            } else {
                fulfill(data);
            }
        });
    });
}

/**
 * Returns the value of the Name tag
 */
var getNameTag = function (tags) {
    for (var i = tags.length - 1; i >= 0; i--) {
        if (tags[i].Key === 'Name') {
            return tags[i].Value;
        }
    }
}

/**
 * Makes sure the EC2 instance is running
 * @param  {Object} instance JSON received from AWS
 * @return {Promise}
 */
var checkEC2InstanceSub = function(instance) {
    return new Promise(function(fulfill) {
        var nonRunningInstances = [];
        var blockingPromises = [];
        var name = getNameTag(instance.Tags);
        name = name ? ' ('+name+')' : '';

        if (instance.State.Name === 'running') {
            var pingPromise = pingCheck(instance, nonRunningInstances);
            blockingPromises.push(pingPromise);
        } else {
            nonRunningInstances.push(instance.InstanceId + name);
        }
        Promise.all(blockingPromises).then(function () {
            if (nonRunningInstances.length > 0) {
                fulfill('Looks like ' + nonRunningInstances[0] + ' has a problem. Better check it out.');
            } else {
                fulfill('The instance ' + instance.InstanceId + name + ' looks good!');
            }
        });
    });
}

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
        };
        EC2Promise(EC2, 'describeInstances', params)
        .then(function (data) {
            checkEC2InstanceSub(data.Reservations[0].Instances[0]).then(function (resp) {
                fulfill(resp);
            });
        }, function (err) {
            // if there is no instance found
            if (err.code === 'InvalidInstanceID.NotFound') {
                fulfill('There is no instance with the instanceId: ' + instanceId);
            } if (err.code === 'InvalidInstanceID.Malformed') {
                var params = {
                    Filters: [{
                        Name:  'tag:Name',
                        Values: [instanceId]
                    }]
                };

                EC2Promise(EC2, 'describeInstances', params)
                .then(function (data) {
                    if (data.Reservations[0] === undefined) {
                        fulfill('There is no instance named: ' + instanceId);
                    } else {
                        checkEC2InstanceSub(data.Reservations[0].Instances[0]).then(function (resp) {
                            fulfill(resp);
                        });
                    }
                }, function (err) {
                    reject(err.message);
                });
            } else {
                reject(err.message);
            }
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
                var name = getNameTag(instance.Tags);
                name = name ? ' ('+name+')' : '';
                nonRunningInstances.push(instance.InstanceId + name);
            }
            fulfill();
        });
    });
}

/**
 * Gets the resource id based on a tag value
 * @param  {String} tagName  name of the tag
 * @param  {String} tagValue value of the tag to match
 * @return {String}          the retrieved resource id
 */
var getResourceIdFromTag = function(tagName, tagValue) {
    return new Promise(function (fulfill, reject) {
        reject('This is not implemented yet');
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
        EC2Promise(EC2, 'describeInstances', {})
        .then(function (data) {
            var instances = data.Reservations[0].Instances;
            var nonRunningInstances = [];
            var blockingPromises = [];

            //look for all of the instances that are not running
            for (var i = instances.length - 1; i >= 0; i--) {
                if (instances[i].State.Name !== 'running') {
                    var name = getNameTag(instances[i].Tags);
                    name = name ? ' ('+name+')' : '';
                    nonRunningInstances.push(instances[i].InstanceId + name);
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
        }, function (err) {
            reject(err);
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
        EC2Promise(EC2, 'describeInstances', {})
        .then(function (data) {
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
        }, function (err) {
            reject(err);
        });
    });
}

/**
 * Returns the cost per hour of an instance type
 * @param  {String} instanceType AWS instance type
 * @return {Float}
 */
var getMachineTypeCost = function(instanceType) {
    switch (instanceType) {
        case 't2.nano':
            return 0.006;
        case 't2.micro':
            return 0.012;
        case 't2.small':
            return 0.023;
        case 't2.medium':
            return 0.047;
        case 't2.large':
            return 0.094;
        case 't2.xlarge':
            return 0.188;
        case 'c4.large':
            return 0.100;
        case 'c4.xlarge':
            return 0.199;
        case 'c4.2xlarge':
            return 0.398;
        case 'm4.2xlarge':
            return 1;
        default:
            return 0;
    }
}

/**
 * Retrieves the cost of an instance from the instance JSON
 * @param  {Object} instance JSON received from AWS
 * @return {Promise}
 */
var getTotalInstanceCostSub = function (instance) {
    return new Promise(function(fulfill) {
        var name = getNameTag(instance.Tags);
        name = name ? ' ('+name+')' : '';

        var cost = getMachineTypeCost(instance.InstanceType);
        var launchEpoch = Math.floor(new Date(instance.LaunchTime) / 1000);
        var currentEpoch = Math.floor(new Date() / 1000);
        // caluclate the number of hours running rounded up (how AWS charges)
        var hours = Math.ceil((currentEpoch - launchEpoch) / 60 / 60);

        var resp = 'The total cost of ' + instance.InstanceId + name + ' is $';
        resp +=  hours*cost + ' over ' + hours + ' hours. ($' + cost + '/hour)';
        fulfill(resp);
    });
}

/**
 * Returns the total cost of an instance
 * @param  {String} instanceId the instanceId or value of Name tag to search for
 * @return {Promise}
 */
exports.getTotalInstanceCost = function (instanceId) {
    if (exports.DEBUG) { console.log('getTotalInstanceCost called.') }

    return new Promise(function(fulfill, reject) {
        var params = {
            InstanceIds: [ instanceId ]
        };
        EC2Promise(EC2, 'describeInstances', params)
        .then(function (data) {
            getTotalInstanceCostSub(data.Reservations[0].Instances[0]).then(function (resp) {
                fulfill(resp);
            });
        }, function (err) {
            // if there is no instance found
            if (err.code === 'InvalidInstanceID.NotFound') {
                fulfill('There is no instance with the instanceId: ' + instanceId);
            } if (err.code === 'InvalidInstanceID.Malformed') {
                var params = {
                    Filters: [{
                        Name:  'tag:Name',
                        Values: [instanceId]
                    }]
                };

                EC2Promise(EC2, 'describeInstances', params)
                .then(function (data) {
                    if (data.Reservations[0] === undefined) {
                        fulfill('There is no instance named: ' + instanceId);
                    } else {
                        getTotalInstanceCostSub(data.Reservations[0].Instances[0]).then(function (resp) {
                            fulfill(resp);
                        });
                    }
                }, function (err) {
                    reject(err.message);
                });
            } else {
                reject(err.message);
            }
        });
    });
}

/**
 * Returns the total cost of all of the instances in the account
 * @return {Promise}
 */
exports.getTotalAccountCost = function () {
    if (exports.DEBUG) { console.log('getTotalAccountCost called.') }

    return new Promise(function(fulfill, reject) {
        // get the cost of all instances in the account
        EC2Promise(EC2, 'describeInstances', {})
        .then(function (data) {
            var instances = data.Reservations[0].Instances;
            var accountHourlyCost = 0;
            var accountTotalCost = 0;

            // loop through all of the instances
            for (var i = instances.length -1; i >= 0; i--) {
                // retrieve the cost of the machine and add it to the running total
                var cost = getMachineTypeCost(instances[i].InstanceType);
                accountHourlyCost += cost;
                var launchEpoch = Math.floor(new Date(instances[i].LaunchTime) / 1000);
                var currentEpoch = Math.floor(new Date() / 1000);
                // caluclate the number of hours running rounded up (how AWS charges)
                var hours = Math.ceil((currentEpoch - launchEpoch) / 60 / 60);
                accountTotalCost += hours*cost;
            }

            var resp = 'The total cost of the account is $';
            resp +=  accountTotalCost + '. All of the machines running cost $' + cost + '/hour.';
            fulfill(resp);
        }, function (err) {
            reject(err);
        });
    });
}

/**
 * Returns a formatted list of all instances
 * @return {Promise}
 */
exports.listInstances = function () {
    if (exports.DEBUG) { console.log('listInstances called.') }

    return new Promise(function(fulfill, reject) {
        EC2Promise(EC2, 'describeInstances', {})
        .then(function (data) {
            var resp = 'Instances:\n';
            // add names of all of the instances
            var instances = data.Reservations[0].Instances;
            for (var i = instances.length - 1; i >= 0; i--) {
                var name = getNameTag(instances[i].Tags);
                name = name ? ' ('+name+')' : '';
                resp += '\t' + instances[i].InstanceId + name + '\n';
            }

            fulfill(resp);
        }, function (err) {
            reject(err);
        });
    });
}