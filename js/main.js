(function (angular) {
    'use strict';

    var xmas = angular.module('xmas', ['angularMoment', 'ticker', 'storage']);


    xmas.controller('GameCtrl', function ($scope, Ticker) {
        $scope.ticks = [];
        $scope.is_running = false;
        $scope.date = new Date(2013, 11, 26);
        $scope.presents = 0;
        
        var no_tick_benefit = function () {return 0;};
        var no_click_benefit = function () {return 1;};
        $scope.items = [
            {
                id: 'elf',
                base_cost: 10,
                label: 'Elf',
                effect: 'Makes 20 presents per day',
                quantity: 0,
                tick_benefit: function () {
                    return this.quantity * 10;
                },
                click_benefit: no_click_benefit
            },
            {
                id: 'santa',
                base_cost: 1000,
                label: 'Santa upgrade',
                effect: 'Increase Santa\'s efficiency 2%',
                quantity: 0,
                tick_benefit: no_tick_benefit,
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
                tick_benefit: no_tick_benefit,
                click_benefit: no_click_benefit
            },
            {
                id: 'sleigh',
                base_cost: 10000,
                label: 'Sleigh upgrade',
                effect: 'Store 100,000 presents for deliver per upgrade',
                quantity: 0,
                tick_benefit: no_tick_benefit,
                click_benefit: no_click_benefit
            }
        ];

        Ticker.tick(function () {
            if ($scope.is_running) {
                $scope.date = moment($scope.date).add(12, 'hours');

                var presents_to_increment = 0;
                angular.forEach($scope.items, function (item) {
                    presents_to_increment += item.tick_benefit();
                });
                $scope.presents += parseInt(presents_to_increment, 10);
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
                presents_to_increment *= item.click_benefit();
            });
            $scope.presents += parseInt(presents_to_increment, 10);
        };

        this.buy_item = function (item) {
            if (get_item_cost(item) <= $scope.presents) {
                $scope.presents -= item.cost;
                item.quantity += 1;
            }
        };

        
    });

    var get_item_cost = function (item) {
        var item_cost = item.base_cost * Math.pow(1.15, item.quantity);
        return parseInt(item_cost, 10);
    };

    xmas.filter('cost', function () {
        return get_item_cost;
    });


}(window.angular));
