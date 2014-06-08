var Future = Npm.require('fibers/future');
var mongo = getMongoConnection();
var FunnelsCache = new Meteor.Collection('funnls-cache');

Analytics.getActivationFunnel = function (from, to, sendUsers) {
  var pickedEvents = [
    'user-register',
    'app-app-created',
    'user-presence',
  ];

  var userIds = {};
  var timeFrame = {$gte: from, $lt: to};

  var collection = mongo.collection('userEvents');
  var aggregate = Meteor._wrapAsync(collection.aggregate.bind(collection));

  var registered = aggregate([
    {$match: {time: timeFrame, event: 'user-register'}},
    {$group: {_id: "$event", users: {$addToSet: "$data.userId"}}}
  ]);

  if(registered[0]) {
    userIds.registered = registered[0].users;
  } else {
    return deliverFunnel();
  }

  var appCreated = aggregate([
    {$match: {time: timeFrame, event: 'app-app-created', "data.userId": {$in: userIds.registered}}},
    {$group: {_id: "$event", users: {$addToSet: "$data.userId"}}}
  ]);

  if(appCreated[0]) {
    userIds.appCreated = appCreated[0].users;
  } else {
    return deliverFunnel();
  }

  var dataSent = aggregate([
    {$match: {
      time: timeFrame,
      event: 'user-presence',
      "data.userId": {$in: userIds.appCreated},
      "data.route": {$in: [
        "dashboard", "appPubSub", "pubsubDetailedView",
        "appMethods", "appDetailedView"
      ]}
    }},
    {$group: {_id: "$event", users: {$addToSet: "$data.userId"}}}
  ]);

  if(dataSent[0]) {
    userIds.dataSent = dataSent[0].users;
  } else {
    return deliverFunnel();
  }

  return deliverFunnel();

  function deliverFunnel() {
    var funnel = {from: from, to: to, counts: {}};

    _.each(userIds, function(users, type) {
      funnel.counts[type] = users.length;
    });

    if(sendUsers) {
      funnel.userIds = userIds;
    }
    return funnel;
  }
}

function getMongoConnection() {
  var coll = new Meteor.Collection('__dummy_collection__');
  coll.findOne();
  return MongoInternals.defaultRemoteCollectionDriver().mongo.db;
}
