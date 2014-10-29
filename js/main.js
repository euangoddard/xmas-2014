(function (angular) {
    'use strict';

    var CHILDREN_ON_EARTH = 1.87E9;

    var SANTAS_MOODS = [
        {label: 'Picky (fewest children get presents)', factor: 0.5},
        {label: 'Meh!', factor: 0.6},
        {label: 'Easy-going (most children get presents)', factor: 0.7},
    ];

    var DATES = {
        START: new Date(2013, 11, 26),
        END: new Date(2013, 11, 29)
    }

    var xmas = angular.module('xmas', ['angularMoment', 'ticker', 'humanize']);

    xmas.controller('GameCtrl', function ($scope, Ticker) {
        $scope.ticks = [];
        $scope.is_running = false;
        $scope.is_over = false;
        $scope.date = DATES.START;
        
        $scope.sleigh = {capacity: 0, power: 0, presents: 0};
        
        $scope.items = [
            {
                id: 'elf',
                base_cost: 15,
                label: 'Elf',
                effect: 'Make 100 presents per day',
                quantity: 0,
                unit_presents: 50,
                on_tick: function () {
                    $scope.sleigh.presents += (this.quantity * this.unit_presents);
                }
            },
            {
                id: 'santa',
                base_cost: 100,
                label: 'Santa upgrade',
                effect: 'Increase Santa\'s efficiency 2%',
                quantity: 0,
                unit_effect: 1.02,
                on_presents_making: function () {
                    $scope.sleigh.presents += pow(this.unit_effect, this.quantity);
                }
            },
            {
                id: 'duplicate',
                base_cost: 20000,
                label: 'Present duplicator',
                effect: 'Duplicate a percentage of presents',
                quantity: 0,
                unit_effect: 0.01,
                on_tick: function () {
                    if (this.quantity) {
                        var effect = 1 + (this.unit_effect * this.quantity);
                        $scope.sleigh.presents = Math.floor($scope.sleigh.presents * effect);
                    }
                }
            },
            {
                id: 'reindeer',
                base_cost: 500,
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
                base_cost: 5000,
                label: 'Reindeer trainer',
                effect: 'Increase reindeer power over time',
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
                base_cost: 1500,
                label: 'Sleigh upgrade',
                effect: 'Store 100,000 presents',
                quantity: 0,
                unit_effect: 100000,
                on_buy: function () {
                    $scope.sleigh.capacity += (this.unit_effect * this.quantity);
                }
            },
            {
                id: 'elf-mechanic',
                base_cost: 10000,
                label: 'Sleigh mechanic',
                effect: 'Increase sleigh capacity over time',
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
                if ($scope.date.isBefore(DATES.END)) {
                    angular.forEach($scope.items, function (item) {
                        if (angular.isFunction(item.on_tick)) {
                            item.on_tick();
                        };
                    });
                } else {
                    $scope.is_over = true;
                    $scope.is_running = false;
                }
            }
        });

        this.start = function () {
            $scope.is_running = true;
        };

        this.set_target_presents = function (presents) {
            $scope.target_presents = presents;
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

        $scope.$watch('santas_mood', function (mood) {
            if (mood) {
                var presents = CHILDREN_ON_EARTH * mood.factor;
                $scope.game_ctrl.set_target_presents(presents);
            }
        });
    });

    xmas.filter('cost', function () {
        return get_item_cost;
    });

    var pow = function (base, power) {
        return parseInt(Math.pow(base, power), 10);
    }


}(window.angular));
