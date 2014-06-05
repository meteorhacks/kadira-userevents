

Template.dashboard.events({
  'click .submit': function (e) {
    var from = new Date($('.from-date').val());
    var to = new Date($('.to-date').val());
    console.log('calling method', from, to);
    Meteor.call('getAnalytics', from, to, function (error, result) {
      $('.result').html(JSON.stringify(result, null, 2));
    });
  }
});
