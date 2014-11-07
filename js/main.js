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
        END: new Date(2014, 11, 25)
    }

    var xmas = angular.module('xmas', ['angularMoment', 'ticker', 'humanize']);

    xmas.controller('GameCtrl', function ($scope, Ticker) {
        var sleigh_time_incrementer = function (item) {
            return function () {
                if (this.quantity) {
                    var multiplicand = 2 * (Math.log(this.quantity));
                    var effect = 1 + (this.unit_effect * multiplicand);
                    $scope.sleigh[item] = cap_number($scope.sleigh[item] * effect);
                }
            };
        };

        var sleigh_buy_incrementer = function (item) {
            return function () {
                $scope.sleigh[item] = cap_number($scope.sleigh[item] + this.unit_effect);
            };
        };
        
        $scope.items = [
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
            },
            {
                id: 'santa',
                base_cost: 100,
                label: 'Santa upgrade',
                effect: 'Increase Santa\'s efficiency 10%',
                quantity: 0,
                unit_effect: 1.1,
                on_presents_making: function () {
                    var new_presents = $scope.sleigh.presents + Math.pow(this.unit_effect, this.quantity);
                    $scope.sleigh.presents = cap_number(new_presents);
                }
            },
            {
                id: 'duplicate',
                base_cost: 20000,
                label: 'Present duplicator',
                effect: 'Duplicate a percentage of presents',
                quantity: 0,
                unit_effect: 0.01,
                on_tick: sleigh_time_incrementer('presents')
            },
            {
                id: 'reindeer',
                base_cost: 500,
                label: 'Reindeer',
                effect: 'Pull a sleigh containing 10,000 presents',
                quantity: 0,
                unit_effect: 10000,
                on_buy: sleigh_buy_incrementer('power')

            },
            {
                id: 'elf-trainer',
                base_cost: 5000,
                label: 'Reindeer trainer',
                effect: 'Increase reindeer power over time',
                quantity: 0,
                unit_effect: 0.01,
                on_tick: sleigh_time_incrementer('power')
            },
            {
                id: 'sleigh',
                base_cost: 1500,
                label: 'Sleigh upgrade',
                effect: 'Store 100,000 presents',
                quantity: 0,
                unit_effect: 100000,
                on_buy: sleigh_buy_incrementer('capacity')
            },
            {
                id: 'elf-mechanic',
                base_cost: 10000,
                label: 'Sleigh mechanic',
                effect: 'Increase sleigh capacity over time',
                quantity: 0,
                unit_effect: 0.01,
                on_tick: sleigh_time_incrementer('capacity')
            }
        ];

        this.reset = function () {
            $scope.is_running = false;
            $scope.is_over = false;
            $scope.is_time_over = false;
            $scope.date = DATES.START;
            $scope.sleigh = {capacity: 0, power: 0, presents: 0};
            angular.forEach($scope.items, function (item) {
                item.quantity = 0;
            });
        };
        this.reset();

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
                    $scope.is_time_over = true;
                    $scope.is_running = false;
                }
            }
        });

        $scope.$watch('sleigh', function (sleigh) {
            var is_end_game_met = true;
            angular.forEach(sleigh, function (item_count) {
                is_end_game_met &= ($scope.target_presents <= item_count);
            });
            if (is_end_game_met) {
                $scope.is_over = true;
                $scope.is_time_over = false;
                $scope.is_running = false;
            }
        }, true);

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

    xmas.directive('yesNo', function () {
        return {
            restrict: 'E',
            scope: {
                target: '=',
                actual: '='
            },
            templateUrl: '../partials/yes-no.html'
        }
    });

    var cap_number = function (number) {
        var number_rounded = Math.floor(number);
        var number_capped = (1E36 < number_rounded) ? Infinity : number_rounded;
        return number_capped;
    };


}(window.angular));
