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

Since the `Ticker` uses `requestAnimationFrame`, in some (mobile) browsers, the interval may be significantly longer than this period if the tab loses focus (or any other conditions are met which suppress the browser from firing the animation).

Therefore, for both of the above reasons, any code in the controller cannot rely on a true time interval since this will not be representative of time in the game. Fortunately, for the most part it's pretty indistinguishable to simply increment the current "date" in the game by 12 game-hours every time there is a tick.

### Setting the goals

The initial idea for the game was for Father Christmas (the player) to produce sufficient presents to give presents to all children in the world when Christmas comes around. [Cookie Clicker](http://orteil.dashnet.org/cookieclicker/) was a great source of inspiration for the repeated clicking ([thanks, Gil]({{ site.baseurl}}thanks/)) and led on to some further ideas about what other purchases could be made.

The main purchasing of presents was achieved by the view calling a method on the controller:

{% highlight html %}
<button type="button" ng-click="game_ctrl.make_presents()">
{% endhighlight %}

The method on the controller was initially quite straight-forward (it added one present to a variable in the `$scope`). Later on it evolved to allow other items to contribute at this point (e.g. the santa upgrade).

In a similar vein to *Cookie Clicker*, the main commodity that you produce is the base currency for all other purchases. I didn't want to replicate Cookie Clicker (which would have been no mean feat!) and so ancillary goals were conceived. These were:

- Generating enough capacity in Father Christmas' sleigh to store the purchased presents
- Generating enough reindeer power to pull the sleigh containing the presents

There were many (crazy) other ideas suggested to me (and dreamt up late at night), but I decided to keep things relatively simple. The mechanism used to implement these items should lead to extensibility should any one care to do so in the future.

### Items

The items which could be purchased, I encoded in the main (root) controller's scope (`GameCtrl` in [main.js](https://github.com/euangoddard/xmas-2014/blob/master/js/main.js)):

{% highlight javascript %}
$scope.items = [
    // items...
];
{% endhighlight %}

The basis for each item was an simple object with the following properties:

- `id` -- used for identification for styling
- `label` -- a friendly label for the UI
- `effect` -- a descriptive version of what effect purchasing the item has
- `base_cost` -- the cost at the start of the game when the item had none of this item had been purchased (see below for details of price ramping)
- `quantity` -- the current number of the item in play
- `unit_effect` -- a value used in calculations around this item (this is quite variable and is closely coupled with the true effect)

In addition to these basic properties, items can define one (or more) of the following methods:

- `on_tick` -- called when ever the `Ticker` fires a tick
- `on_buy` -- called when ever one of these items is purchased
- `on_present_making` -- called when ever the user clicks on the *make present* button

I experimented with various approaches to this, and this allowed for the greatest degree of flexibility to delegate the effect to the item itself. In the end, none of the items had multiple effects (they merely implemented one of the above methods). Moreover, the similarities of the implementations could be factored out:

#### `on_tick()`

`on_tick()` was implemented by *the elf*, *the present duplicator*, *the reindeer trainer* and *the sleigh mechanic* and in the end I created a partial that was used for all but the elf:

{% highlight javascript %}
var sleigh_time_incrementer = function (item) {
    return function () {
        if (this.quantity) {
            var multiplicand = 2 * (1 + Math.log(this.quantity));
            var effect = 1 + (this.unit_effect * multiplicand);
            $scope.sleigh[item] = cap_number($scope.sleigh[item] * effect);
        }
    };
};
{% endhighlight %}

The need for this complexity was to ensure that things didn't get out of hand when a large number of items had been purchased, but also to ensure that there was a realistic way of achieving the relatively high number of target presents.

For the elf, this was much more straight-forward (simply add the number of presents each elf can produce times by the total number of elves):

{% highlight javascript %}
{
    id: 'elf',
    base_cost: 15,
    label: 'Elf',
    effect: 'Make 100 presents per day',
    quantity: 0,
    unit_presents: 50,
    on_tick: function () {
        var new_presents = $scope.sleigh.presents + (this.quantity * this.unit_presents);
        $scope.sleigh.presents = cap_number(new_presents);
    }
}
{% endhighlight %}

#### `on_buy()`

`on_buy()` was implemented by *the reindeer* and *the sleigh upgrade*. I created a partial that was used by these since it simply incremented a count in the `sleigh` object which stored information about the game state:

{% highlight javascript %}
var sleigh_buy_incrementer = function (item) {
    return function () {
        $scope.sleigh[item] = cap_number($scope.sleigh[item] + this.unit_effect);
    };
};
{% endhighlight %}

### Item cost

In order to prevent too many items being purchased (especially those items which delivered immediate benefit to the number of presents available), I used the same algorithm for item pricing as *Cookie Clicker*:


{% highlight javascript %}
var get_item_cost = function (item) {
    var item_cost = item.base_cost * Math.pow(1.15, item.quantity);
    return parseInt(item_cost, 10);
};
{% endhighlight %}

For the relative base-costs of the items themselves, I used a similar model to the increments that *Cookie Clickers* uses, but made the curve slightly less steep since not all item delivered benefit in terms of presents.

## Tuning the results

Once the initial work was complete, one of the hardest things was to tune the growth curve of presents (and other assets) so that the player could realistically achieve the target in the time available (about 12 minutes). I'm sure I could have been more scientific about this, but in the end I played with growth curves to ensure that some of the time-based benefits didn't grow too quickly or slowly.

This gave rise to the slightly odd logarithmic relationship for the `sleigh_time_incrementer` to ensure that the player saw some early benefits but repeated purchases had less and less effect to stop things getting out of hand.

## The rest

Although this article is relatively detailed in some aspects it completely glosses over how I went about some bits and pieces. I hope that the [source code](https://github.com/euangoddard/xmas-2014/) is self-documenting for any one who cares to see what was going on.
