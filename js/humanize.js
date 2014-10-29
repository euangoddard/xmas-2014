(function (angular) {
    'use strict';

    var humanize = angular.module('humanize', []);

    var EXPONENT_NAMES = [
        'million',
        'billion',
        'trillion',
        'quadrillion',
        'quintillion',
        'sextillion',
        'septillion',
        'octillion',
        'nonillion',
        'decillion'
    ];

    var MIN_EXPONENT = 6;
    var EXPONENT_STEP = 3;

    humanize.filter('humanize_number', function ($filter) {
        return function (number) {
            var number_10_power = log10(number);
            var exponent_index = Math.floor((number_10_power - MIN_EXPONENT) / EXPONENT_STEP, 10);
            
            var exponent_name = EXPONENT_NAMES[exponent_index];
            
            var number_humanized;
            if (exponent_name) {
                var exponent = MIN_EXPONENT + (EXPONENT_STEP * exponent_index);
                var exponent_multiple = round_to_2dp(number / Math.pow(10, exponent));
                number_humanized = exponent_multiple + ' ' + exponent_name;
            } else {
                // Cater for numbers for which are too small or too large
                number_humanized = $filter('number')(number);
            }
            return number_humanized;
        };
    });

    var round_to_2dp = function (number) {
        return Math.round(number * 100) / 100;
    };

    // Polyfill browsers which don't support Math.log10
    var log10;
    if (Math.hasOwnProperty('log10')) {
        log10 = Math.log10;
    } else {
        log10 = function (number) {
            return Math.log(number) / Math.LN10;
        };
    }

}(window.angular));