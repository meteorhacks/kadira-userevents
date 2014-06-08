
Meteor.methods({
  getActivationFunnel: function (from, to, range) {
    check(from, Date);
    check(to, Date);
    check(range, Match.Optional(Number));
    range = range || 1000 * 60 * 60 * 24; //one day

    var timeFrames = buildTimeFrames(from.getTime(), to.getTime(), range);
    var funnels = [];
    timeFrames.forEach(function(timeFrame) {
      funnels.push(Analytics.getActivationFunnel(timeFrame.from, timeFrame.to));
    });

    return funnels;
  }
});


function buildTimeFrames(from, to, range) {
  var frames = [];
  var lastTo = from;

  while(true) {
    var _from = lastTo;
    var _to = lastTo + range;
    console.log(_from, _to);
    if(_to <= to) {
      frames.push({
        from: new Date(_from),
        to: new Date(_to)
      });
      lastTo = _to;
    } else {
      break;
    }
  }

  return frames;
}
