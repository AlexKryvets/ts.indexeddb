(function (window, angular, undefined) {

    'use strict';

    angular.module('ts.indexedDB', []).provider('IndexedDB', [function () {
        var provider = this;
        provider.DBConfig = {};
        var _connections = {};

        this.$get = ['$window', '$q', function ($window, $q) {
            if (!$window.indexedDB) {
                $window.indexedDB = $window.mozIndexedDB || $window.webkitIndexedDB || $window.msIndexedDB;
            }

            return {
                'getConnection': function (name) {
                    var deferred = $q.defer();
                    if (_connections[name]) {
                        deferred.resolve(_connections[name]);
                    } else if (provider.DBConfig[name]) {
                        var config = provider.DBConfig[name];
                        var request = $window.indexedDB.open(name, config.version || 1);
                        request.onsuccess = function (event) {
                            _connections[name] = event.target.result;
                            deferred.resolve(event.target.result);
                        };
                        request.onerror = function (event) {
                            deferred.reject(event);
                        };
                        request.onupgradeneeded = function (event) {
                            var db = event.target.result;
                            config.onUpgrade(db, event);
                        }

                    } else {
                        deferred.reject('Check DB config for ' + name);
                    }
                    return deferred.promise;
                }
            };
        }];
    }]);

})(window, window.angular);