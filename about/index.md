---
layout: simple
title: About the 2014 Christmas card
---

# {{ page.title }}

## The basic idea

This year I wanted to experiment with building a time-limited game. When I set out, my original idea was to have a game which involved helping Father Christmas produce presents for Christmas 2014 over a limited period of time by purchasing various items. This idea carried forward to the final product with various enhancements and added complexities coming along the way!

## How I did it

This part is fairly technical and requires a good understanding of JavaScript and the [AngularJS framework](https://angularjs.org/).

### Framework selection

I picked AngularJS as the framework as I love it and already knew how to use it. There may have been better candidates out there, but with a child under 1 my time was limited for due diligence.

Given the recent release of Angular 1.3 I decided to not even try to support legacy browsers and have only tested with evergreen browsers, so if you're trying to play on IE6 -- sorry!

### The main game loop

The first step was creating mechanism for having a game *"tick"* which would run in a loop. Angular doesn't support anything like this natively, but it would easy enough to create a service which used `requestAnimationFrame` to call into the AngularJS framework every second (taken from [ticker.js](https://github.com/euangoddard/xmas-2014/blob/master/js/ticker.js)):

{% highlight javascript %}
var start_animation_loop = function (callback) {
    var loop = function (timestamp) {
        request_animation_frame(loop); // this is a wrapper to support vendor prefixing
        callback(timestamp);
    }
    loop();
};

var ticker = angular.module('ticker', []);
ticker.factory('Ticker', function ($rootScope) {
    var TICK_INTERVAL = 1000;
    var last_tick_time = 0;

    var tick = function (callback) {
        callback();
        start_animation_loop(function (tick_time) {
            if ((last_tick_time + TICK_INTERVAL) < tick_time) {
                $rootScope.$apply(callback);
                last_tick_time = tick_time;
            }
        });

    };

    return {tick: tick};
});
{% endhighlight %}

This is then used by the main game controller as such:

{% highlight javascript %}
Ticker.tick(function () {
    // code here gets called every 1000 ms
});
{% endhighlight %}

The ticker tries to call the code about `1000 ms` apart, but since the `Ticker` service has to initiate a scope digest when it's time, the real interval will be at least this value depending on how much is done in the scope digest (and potentially other digests which might delay the `Ticker` initiates.

Since the `Ticker` uses `requestAnimationFrame`, in some (mobile) browsers, the interval may be significantly longer than this period of the tab loses focus (or any other conditions are met which suppress the browser from firing the animation).

Therefore, for both of the above reasons, any code in the controller cannot rely on a true time interval since this will not be representative of time in the game. Fortunately, for the most part it's pretty indistinguishable to simply increment the current "date" in the game by 12 hours every time there is a tick.

### Setting the goals

The initial idea for the game was for Father Christmas (the player) to produce sufficient presents to give presents to all children in the world when Christmas comes around. [Cookie Clicker](http://orteil.dashnet.org/cookieclicker/) was a great source of inspiration for the repeated clicking ([thanks, Gil]({{ site.baseurl}}thanks/)) and led on to some further ideas about what other purchases could be made.

The main purchasing of presents was achieved by the viewing calling a method on the controller:

{% highlight html %}
<button type="button" ng-click="game_ctrl.make_presents()">
{% endhighlight %}

The method on the controller was initially quite straight-forward (it added one present to a variable in the `$scope`). Later on it evolved (see below).

In a similar vein to *Cookie Clicker*, the main commodity that you produce is the base currency for all other purchases. I didn't want to replicate Cookie Clicker (which would have been no mean feat!) and so ancillary goals were conceived. These were:

- Generating enough capacity in Father Christmas' sleigh to store the purchased presents
- Generating enough reindeer power to pull the sleigh containing the presents

There were many (crazy) other ideas suggested to me (and dreamt up late at night), but I decided to keep things relatively simple. The mechanism used to implement these items should lead to extensibility should any one care to do so in the future.

The items which could be purchased, I encoded in the main (root) controller's scope (`GameCtrl`):

{% highlight javascript %}
$scope.items = [];
{% endhighlight %}

