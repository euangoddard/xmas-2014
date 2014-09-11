(function (angular) {
    'use strict';

    var xmas = angular.module('xmas', ['angularMoment', 'ticker']);

    xmas.controller('GameCtrl', function ($scope, Ticker) {
        $scope.ticks = [];
        $scope.is_running = false;
        $scope.date = new Date(2013, 11, 26);
        Ticker.tick(function () {
            if ($scope.is_running) {
                $scope.date = moment($scope.date).add(1, 'hours');
            }
        });

        this.start = function () {
            $scope.is_running = true;
        };

        this.pause = function () {
            $scope.is_running = false;
        };
        
    });


}(window.angular));
