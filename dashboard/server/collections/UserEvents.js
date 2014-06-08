var Future = Npm.require('fibers/future');
var mongo = getMongoConnection();
var FunnelsCache = new Meteor.Collection('funnls-cache');

Analytics.getActivationFunnel = function (from, to, sendUsers) {
  var pickedEvents = [
    'user-register',
    'app-app-created'
  ];

  var supportedRoutes = [
    "dashboard", "appPubSub", "pubsubDetailedView",
    "appMethods", "appDetailedView"
  ];

  var userIds = {};
  var timeFrame = {$gte: from, $lt: to};

  var collection = mongo.collection('userEvents');
  var aggregate = Meteor._wrapAsync(collection.aggregate.bind(collection));

  var result = aggregate([
    {$match: {$or: [
      {time: timeFrame, event: {$in: pickedEvents}},
      {time: timeFrame, event: "user-presence", "data.route": {$in: supportedRoutes}}
    ]}},
    {$group: {_id: "$event", users: {$addToSet: "$data.userId"}}}
  ]);

  var users = {};
  result.forEach(function(oneResult) {
    if(oneResult._id == "user-register") {
      users.registered = oneResult.users;
    } else if(oneResult._id == "app-app-created") {
      users.appCreated = oneResult.users;
    } else if(oneResult._id == "user-presence") {
      users.dataSent = oneResult.users;
    }
  });

  var userIds = {};
  if(users.registered) {
    userIds.registered = users.registered;
  } else {
    return deliverFunnel();
  }

  if(users.appCreated) {
    userIds.appCreated = _.intersection(users.appCreated, users.registered);
  } else {
    return deliverFunnel();
  }

  if(users.dataSent) {
    userIds.dataSent = _.intersection(users.dataSent, users.registered);
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
