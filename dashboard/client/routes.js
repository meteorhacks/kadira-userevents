
Meteor.startup(function () {

  Router.map(function () {
    this.route( 'dashboard', {
      template: 'dashboard',
      path: '/'
    });
  });

});
