var Future = Npm.require('fibers/future');
var mongo = getMongoConnection();

UserEvents = new Meteor.Collection('userEvents');

UserEvents.getAnalytics = function (from, to) {
  var f = new Future();
  var pickedEvents = [
    'user-register',
    'app-app-created',
    'user-presence',
    'data.route'
  ];
  var pipeline = [
    {$match: {time: {$gte: from, $lt: to}, event: {$in: pickedEvents}}},
    {$sort : {time : 1}},
    {$group: {_id: {event: '$event'}, users: {$addToSet: '$data.userId'}}},
  ];
  var collection = mongo.collection('userEvents');
  collection.aggregate(pipeline, function (err, result) {
    var obj = {};
    result.forEach(function (item) {
      obj[item._id.event] = {
        users: item.users.length || 0
      };
    });
    console.log('* obj', obj);
    f.return(obj);
  });
  return f.wait();
}

function getMongoConnection() {
  var coll = new Meteor.Collection('__dummy_collection__');
  coll.findOne();
  return MongoInternals.defaultRemoteCollectionDriver().mongo.db;
}
