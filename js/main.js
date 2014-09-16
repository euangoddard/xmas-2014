(function (angular) {
    'use strict';

    var xmas = angular.module('xmas', ['angularMoment', 'ticker']);


    xmas.controller('GameCtrl', function ($scope, Ticker) {
        $scope.ticks = [];
        $scope.is_running = false;
        $scope.date = new Date(2013, 11, 26);
        $scope.presents = 0;
        $scope.items = [
            {
                id: 'elf',
                cost: 10,
                label: 'Elf',
                effect: 10,
                quantity: 0
            },
            {
                id: 'reindeer',
                cost: 100,
                label: 'Reindeer',
                effect: 20,
                quantity: 0
            },
            {
                id: 'santa',
                cost: 1000,
                label: 'Santa upgrade',
                effect: 30,
                quantity: 0
            },
            {
                id: 'sleigh',
                cost: 10000,
                label: 'Sleigh upgrade',
                effect: 40,
                quantity: 0
            }
        ];

        Ticker.tick(function () {
            if ($scope.is_running) {
                $scope.date = moment($scope.date).add(12, 'hours');

                var presents_to_increment = 0;
                angular.forEach($scope.items, function (item) {
                    presents_to_increment += (item.effect * item.quantity);
                });
                $scope.presents += presents_to_increment;
            }
        });

        this.start = function () {
            $scope.is_running = true;
        };

        this.pause = function () {
            $scope.is_running = false;
        };

        this.make_present = function () {
            $scope.presents += 1;
        };

        this.buy_item = function (item) {
            if (item.cost <= $scope.presents) {
                $scope.presents -= item.cost;
                item.quantity += 1;
            }
        };
        
    });


}(window.angular));
