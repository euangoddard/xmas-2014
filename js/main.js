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
        $scope.presents = 0;
        
        $scope.items = [
            {
                id: 'elf',
                base_cost: 10,
                label: 'Elf',
                effect: 'Makes 20 presents per day',
                quantity: 0,
                tick_presents_benefit: function () {
                    return this.quantity * 10;
                }
            },
            {
                id: 'santa',
                base_cost: 1000,
                label: 'Santa upgrade',
                effect: 'Increase Santa\'s efficiency 2%',
                quantity: 0,
                click_benefit: function () {
                    return Math.pow(1.02, this.quantity);
                }
            },
            {
                id: 'reindeer',
                base_cost: 100,
                label: 'Reindeer',
                effect: 'Pull a sleigh containing 10,000 presents',
                quantity: 0,
                unit_power: 10000,
                get_total_power: function () {
                    return this.unit_power * this.quantity;
                }
            },
            {
                id: 'elf-trainer',
                base_cost: 100,
                label: 'Reindeer trainer',
                effect: 'Increases the ability of reindeer to pull the sleigh over time',
                quantity: 0,
                tick_power_benefit: function () {
                    return Math.pow(1.02, this.quantity);
                }
            },
            {
                id: 'sleigh',
                base_cost: 10000,
                label: 'Sleigh upgrade',
                effect: 'Store 100,000 presents for delivery',
                quantity: 0,
                unit_capacity: 100000,
                get_total_capacity: function () {
                    return this.quantity * this.unit_capacity;
                }
            },
            {
                id: 'elf-mechanic',
                base_cost: 100,
                label: 'Sleigh mechanic',
                effect: 'Increases the capacity of the sleigh over time',
                quantity: 0,
                tick_capacity_benefit: function () {
                    return Math.pow(1.02, this.quantity);
                }
            }
        ];

        Ticker.tick(function () {
            if ($scope.is_running) {
                $scope.date = moment($scope.date).add(12, 'hours');

                var presents_to_increment = 0;
                angular.forEach($scope.items, function (item) {
                    if (angular.isFunction(item.tick_presents_benefit)) {
                        presents_to_increment += item.tick_presents_benefit();
                    }
                });
                $scope.presents += parseInt(presents_to_increment, 10);

                var power_to_increment = 0;
                angular.forEach($scope.items, function (item) {
                    if (angular.isFunction(item.tick_power_benefit)) {
                        power_to_increment += item.tick_power_benefit();
                    }
                });
                $scope.sleigh.power += power_to_increment;

                var capacity_to_increment = 0;
                angular.forEach($scope.items, function (item) {
                    if (angular.isFunction(item.tick_capacity_benefit)) {
                        capacity_to_increment += item.tick_capacity_benefit();
                    }
                });
                $scope.sleigh.capacity += capacity_to_increment;
                
            }
        });

        this.start = function () {
            $scope.is_running = true;
        };

        this.pause = function () {
            $scope.is_running = false;
        };

        this.make_presents = function () {
            var presents_to_increment = 1;
            angular.forEach($scope.items, function (item) {
                if (angular.isFunction(item.click_benefit)) {
                    presents_to_increment *= item.click_benefit();
                }
            });
            $scope.presents += parseInt(presents_to_increment, 10);
        };

        this.buy_item = function (item) {
            var item_cost = get_item_cost(item);
            if (item_cost <= $scope.presents) {
                $scope.presents -= item_cost;
                item.quantity += 1;
            }
        };

        $scope.sleigh = {capacity: 0, power: 0};
        $scope.$watch('items', function (items) {
            var items_by_id = _.indexBy(items, 'id');
            $scope.sleigh.capacity = items_by_id.sleigh.get_total_capacity();
            $scope.sleigh.power = items_by_id.reindeer.get_total_power();
        }, true);
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


}(window.angular));
