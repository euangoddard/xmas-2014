    (function (angular) {
    'use strict';

    var xmas = angular.module('xmas', ['angularMoment', 'ticker', 'storage']);

    var SANTAS_MOODS = [
        {label: 'Picky (fewest children get presents)', factor: 0.5},
        {label: 'Meh!', factor: 0.6},
        {label: 'Easy-going (most children get presents)', factor: 0.7},
    ];

    xmas.controller('GameCtrl', function ($scope, Ticker) {
        $scope.ticks = [];
        $scope.is_running = false;
        $scope.date = new Date(2013, 11, 26);
        
        $scope.sleigh = {capacity: 0, power: 0, presents: 0};
        
        $scope.items = [
            {
                id: 'elf',
                base_cost: 10,
                label: 'Elf',
                effect: 'Makes 20 presents per day',
                quantity: 0,
                unit_presents: 10,
                on_tick: function () {
                    $scope.sleigh.presents += (this.quantity * this.unit_presents);
                }
            },
            {
                id: 'santa',
                base_cost: 500,
                label: 'Santa upgrade',
                effect: 'Increase Santa\'s efficiency 2%',
                quantity: 0,
                unit_effect: 1.02,
                on_presents_making: function () {
                    $scope.sleigh.presents += pow(this.unit_effect, this.quantity);
                }
            },
            {
                id: 'reindeer',
                base_cost: 100,
                label: 'Reindeer',
                effect: 'Pull a sleigh containing 10,000 presents',
                quantity: 0,
                unit_effect: 10000,
                on_buy: function () {
                    $scope.sleigh.power += (this.unit_effect * this.quantity);
                }

            },
            {
                id: 'elf-trainer',
                base_cost: 250,
                label: 'Reindeer trainer',
                effect: 'Increases the ability of reindeer to pull the sleigh over time',
                quantity: 0,
                unit_effect: 1.02,
                on_tick: function () {
                    if (this.quantity) {
                        $scope.sleigh.power = parseInt($scope.sleigh.power * Math.pow(this.unit_effect, this.quantity), 10);
                    }
                }
            },
            {
                id: 'sleigh',
                base_cost: 1000,
                label: 'Sleigh upgrade',
                effect: 'Store 100,000 presents for delivery',
                quantity: 0,
                unit_effect: 100000,
                on_buy: function () {
                    $scope.sleigh.capacity += (this.unit_effect * this.quantity);
                }
            },
            {
                id: 'elf-mechanic',
                base_cost: 2500,
                label: 'Sleigh mechanic',
                effect: 'Increases the capacity of the sleigh over time',
                quantity: 0,
                unit_effect: 1.02,
                on_tick: function () {
                    if (this.quantity) {
                        $scope.sleigh.capacity = parseInt($scope.sleigh.capacity * Math.pow(this.unit_effect, this.quantity), 10);
                    }
                }
            }
        ];

        Ticker.tick(function () {
            if ($scope.is_running) {
                $scope.date = moment($scope.date).add(12, 'hours');

                angular.forEach($scope.items, function (item) {
                    if (angular.isFunction(item.on_tick)) {
                        item.on_tick();
                    };
                });
            }
        });

        this.start = function () {
            $scope.is_running = true;
        };

        this.pause = function () {
            $scope.is_running = false;
        };

        this.make_presents = function () {
            angular.forEach($scope.items, function (item) {
                if (angular.isFunction(item.on_presents_making)) {
                    item.on_presents_making();
                }
            });
        };

        this.buy_item = function (item) {
            var item_cost = get_item_cost(item);
            if (item_cost <= $scope.sleigh.presents) {
                $scope.sleigh.presents -= item_cost;
                item.quantity += 1;
                if (angular.isFunction(item.on_buy)) {
                    item.on_buy();
                };
            }
        };
    });

    var get_item_cost = function (item) {
        var item_cost = item.base_cost * Math.pow(1.15, item.quantity);
        return parseInt(item_cost, 10);
    };

    xmas.controller('SetupCtrl', function ($scope) {
        $scope.santas_moods = SANTAS_MOODS;
        $scope.santas_mood = SANTAS_MOODS[0];
    });

    xmas.filter('cost', function () {
        return get_item_cost;
    });

    var pow = function (base, power) {
        return parseInt(Math.pow(base, power), 10);
    }


}(window.angular));
