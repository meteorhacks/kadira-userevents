
Meteor.methods({
  getAnalytics: function (from, to) {
    check(from, Date);
    check(to, Date);
    return UserEvents.getAnalytics(from, to);
  }
});
