/**
 * Copyright (c) 2014 Kinvey Inc.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 *
 */

var body = document.getElementsByTagName('body')[0];

setTimeout(function () {
    body.setAttribute('ng-app', 'Logitrack-Angular');
    angular.bootstrap(body, ['ng', 'Logitrack-Angular']);
}, 2000);

var app = angular.module('Logitrack-Angular', [ 'kinvey', 'ngRoute', 'controllers' ]);

//inject Providers into config block
app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
        when('/templates/login', {
            templateUrl: 'templates/login.html',
            controller: 'LoginController'
        }).
        when('/templates/main', {
            templateUrl: 'templates/main.html',
            controller: 'MainController'
        }).
        when('/templates/password_reset', {
            templateUrl: 'templates/password_reset.html',
            controller: 'PasswordResetController'
        }).
        when('/templates/sign_up', {
            templateUrl: 'templates/sign_up.html',
            controller: 'SignUpController'
        }).
        when('/templates/new_dispatch', {
            templateUrl: 'templates/new_dispatch.html',
            controller: 'NewDispatchController'
        }).
        when('/templates/map', {
            templateUrl: 'templates/map.html',
            controller: 'MapController'
        });
}]);

//inject instances (not Providers) into run blocks
app.run(['$location', '$kinvey', '$rootScope', '$timeout', function ($location, $kinvey, $rootScope) {
    // Kinvey initialization starts
    var promise = $kinvey.init({
        appKey: 'kid_VTpS9qbe7q',
        appSecret: '5ae17c3bd8414d7f917c59a1c14a8fcd'
    });
    promise.then(function () {
        // Kinvey initialization finished with success
        console.log("Kinvey init with success");
        determineBehavior($kinvey, $location, $rootScope);
    }, function (errorCallback) {
        // Kinvey initialization finished with error
        console.log("Kinvey init with error: " + JSON.stringify(errorCallback));
        determineBehavior($kinvey, $location, $rootScope);
    });
}]);


//function selects the desired behavior depending on whether the user is logged or not
function determineBehavior($kinvey, $location, $rootScope) {
    var activeUser = $kinvey.getActiveUser();
    console.log("$location.$$url: " + $location.$$url);
    if (activeUser != null) {
        console.log("activeUser not null determine behavior");
        if ($location.$$url != '/templates/main') {
            $location.path('/templates/main');
        }
    } else {
        console.log("activeUser null redirecting");
        if ($location.$$url != '/templates/login') {
            $location.path('/templates/login');
        }
    }
}