var app = angular.module('Logitrack-Angular', [ 'kinvey', 'ngRoute', 'controllers' ]);

//inject Providers into config block
app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        when('/templates/login', {
            templateUrl: 'templates/login.html',
            controller: 'LoginController'
        }).
        when('/templates/main', {
            templateUrl: 'templates/main.html',
            controller: 'MainController'
        }).
       otherwise({
            redirectTo: '/templates/login'
        });
}]);

//inject instances (not Providers) into run blocks
app.run(['$location', '$kinvey', '$rootScope', function($location, $kinvey, $rootScope) {
    // Kinvey initialization starts
    var promise = $kinvey.init({
        appKey : 'kid_VTpS9qbe7q',
        appSecret : '5ae17c3bd8414d7f917c59a1c14a8fcd'
    });
    promise.then(function() {
        // Kinvey initialization finished with success
        console.log("Kinvey init with success");
        determineBehavior($kinvey, $location, $rootScope);
    }, function(errorCallback) {
        // Kinvey initialization finished with error
        console.log("Kinvey init with error: " + JSON.stringify(errorCallback));
        determineBehavior($kinvey, $location, $rootScope);
    });
}]);


//function selects the desired behavior depending on whether the user is logged or not
function determineBehavior($kinvey, $location, $rootScope) {
    var activeUser = $kinvey.getActiveUser();
    console.log("$location.$$url: " + $location.$$url);
    alert("$location.$$url: " + $location.$$url);
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