var activationFunnels = [];
var activationFunnelsDeps = new Deps.Dependency();

Template.dashboard.activationFunnels = function() {
  activationFunnelsDeps.depend();
  return activationFunnels;
};

Template.dashboard.prettyDate = function(date) {
  var str = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();
  return str;
};

Template.dashboard.pct = function(a, b) {
  var pct = (a/b) * 100;
  return Math.ceil(pct);
};

Template.dashboard.events({
  'click .submit': function (e) {
    var from = new Date($('.from-date').val());
    var to = new Date($('.to-date').val());
    Meteor.call('getActivationFunnel', from, to, function (error, funnels) {
      activationFunnels = funnels;
      activationFunnelsDeps.changed();
    });
  }
});
