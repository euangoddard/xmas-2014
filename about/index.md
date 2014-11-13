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
        request_animation_frame(loop);
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

This is then used...