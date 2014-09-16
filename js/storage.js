(function (angular) {
    'use strict';

    var storage = angular.module('storage', []);

    storage.factory('storage', function () {
        return {
            get: function (key) {
                var value = localStorage.getItem(key);
                return value ? angular.fromJson(value) : value;
            },

            put: function (key, value) {
                localStorage.setItem(key, angular.toJson(value));
            },

            remove: function (key) {
                localStorage.removeItem(key);
            },

            clear: function () {
                localStorage.clear();
            }
        };

    });

}(window.angular));