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
var controllers = angular.module('controllers', ['ui.bootstrap']);

controllers.service('currentTrip', function() {
    var trip = {};
    return {
        getTrip: function() {
            return trip;
        },
        setTrip: function(value) {
            trip = value;
        }
    }
});

controllers.service('menuItem',function(){
    var menu_item = {};
    return {
        getItem: function() {
            return menu_item;
        },
        setItem: function(value) {
            menu_item = value;
        }
    }
});

controllers.controller('LoginController',
    ['$scope', '$kinvey', "$location", function ($scope, $kinvey, $location) {
        //Kinvey login starts
        $scope.login = function(){
            var isFormInvalid = false;
            $scope.submittedError=false;
            //check is form valid
            if ($scope.loginForm.username.$error.required) {
                $scope.submittedUsername = true;
                isFormInvalid = true;
            } else {
                $scope.submittedUsername = false;
            }
            if ($scope.loginForm.password.$error.required) {
                $scope.submittedPassword = true;
                isFormInvalid = true;
            } else {
                $scope.submittedPassword = false;
            }
            if (isFormInvalid) {
                return;
            }
            var promise = $kinvey.User.login({
                username: $scope.username,
                password: $scope.password
            });
            promise.then(
                function (response) {
                    //Kinvey login finished with success
                    $scope.submittedError = false;
                    $location.path('/templates/main');
                },
                function (error) {
                    //Kinvey login finished with error
                    $scope.submittedError = true;
                    $scope.errorDescription = error.description;
                    console.log("Error login " + error.description);
                }
            );
        }
        $scope.forgetPassword = function () {
            $location.path('/templates/password_reset');
        }
        $scope.registerUser = function () {
            $location.path('/templates/sign_up');
        }
    }]);

controllers.controller('PasswordResetController',
    ['$scope', '$kinvey', "$location", function ($scope, $kinvey, $location) {
        $scope.resetPassword = function(){
            console.log("click reset");
            if ($scope.resetPasswordForm.email.$error.email || $scope.resetPasswordForm.email.$error.required) {
                $scope.submittedEmail = true;
                return;
            }else{
                $scope.submittedEmail = false;
            }
            //Kinvey reset password starts
            var promise = $kinvey.User.resetPassword($scope.email);
            promise.then(
                function () {
                    //Kinvey reset password finished with success
                    console.log("resetPassword");
                    $location.path("/templates/login");
                });
        }
    }]);

controllers.controller('SignUpController',
    ['$scope', '$kinvey', "$location", function ($scope, $kinvey, $location) {
        //Kinvey login starts
        $scope.signUp = function(){
            var isFormInvalid = false;
            $scope.submittedError=false;
            //check is form valid
            if ($scope.signUpForm.first_name.$error.required) {
                $scope.submittedFirstName= true;
                isFormInvalid = true;
            } else {
                $scope.submittedFirstName = false;
            }
            if ($scope.signUpForm.last_name.$error.required) {
                $scope.submittedLastName = true;
                isFormInvalid = true;
            } else {
                $scope.submittedLastName = false;
            }
            if ($scope.signUpForm.username.$error.required) {
                $scope.submittedUsername = true;
                isFormInvalid = true;
            } else {
                $scope.submittedUsername = false;
            }
            if ($scope.signUpForm.password.$error.required) {
                $scope.submittedPassword = true;
                isFormInvalid = true;
            } else {
                $scope.submittedPassword = false;
            }
            if ($scope.signUpForm.telephone_number.$error.required) {
                $scope.submittedTelephoneNumber = true;
                isFormInvalid = true;
            } else {
                $scope.submittedTelephoneNumber = false;
            }
            if ($scope.signUpForm.email.$error.email || $scope.signUpForm.email.$error.required) {
                $scope.submittedEmail = true;
                isFormInvalid = true;
                return;
            }else{
                $scope.submittedEmail = false;
            }
            if (isFormInvalid) {
                return;
            }
            var promise = $kinvey.User.signup({
                username: $scope.username,
                password: $scope.password,
                email: $scope.email,
                first_name: $scope.first_name,
                last_name: $scope.last_name,
                mobile_number: $scope.telephone_number
            });
            console.log("signup promise");
            promise.then(
                function () {
                    //Kinvey signup finished with success
                    $scope.submittedError = false;
                    console.log("signup success");
                    $location.path("/templates/main");
                },
                function(error) {
                    //Kinvey signup finished with error
                    $scope.submittedError = true;
                    $scope.errorDescription = error.description;
                    console.log("signup error: " + error.description);
                }
            );
        }
    }]);

controllers.controller('MainController',
    ['$scope', '$kinvey', "$location","menuItem", function ($scope, $kinvey, $location,menuItem) {
        $scope.isEdit=[];
        $scope.tripDropdownDisabled = true;
        var promise = $kinvey.DataStore.find('shipment', null, {relations: { route: 'route',
            client: "clients"}});
        promise.then(
            function (response) {
                $scope.shipments = [];
                $scope.progress_shipments = [];
                for (var i in response) {
                    if (response[i].user_status === "pending") {
                        $scope.shipments.push(response[i]);
                    } else if (response[i].user_status === "in progress") {
                        $scope.progress_shipments.push(response[i]);
                    }
                }
                console.log("get shipment success");
            },
            function (error) {
                console.log("get shipment error " + JSON.stringify(error.description));
            }
        );

        $scope.menu_profile_items = [
            {
                id: 0, title: "Change name or bio"
            },
            {
                id: 1, title: "Change email"
            },
            {
                id: 2, title: "Change password"
            }
        ];

        $scope.createNewDispatch = function () {
            $scope.shipments.unshift({});
            $scope.isEdit.unshift(true);
            $scope.selected_client = "Select client";
            $scope.selected_trip = "Select trip";
            $scope.status = {
                isopen: false
            };

            var promise = $kinvey.DataStore.find('clients', null);
            promise.then(
                function (response) {
                    $scope.clients = response;
                },
                function (error) {
                    console.log("get clients error " + error.description);
                }
            );
        };

        $scope.signOut = function(){
            var user = $kinvey.getActiveUser();
            if(null !== user) {
                var promise = $kinvey.User.logout();
                promise.then(
                    function(){
                        $location.path("templates/login");
                    },
                    function(error){
                        console.log("Sign out error " + error.description);
                    }
                );
            }
        };

        $scope.changeProfile = function(item){
            menuItem.setItem(item);
            $location.path("templates/edit_profile");
        };


        $scope.showClientForm = function () {
            $scope.isShowClientForm = true;
            $scope.hideClientButtons = true;
            $scope.showTripDropdown = false;
        };


        $scope.selectClient = function (client,shipment) {
            $scope.status.isClientsOpen = !$scope.status.isClientsOpen;
            $scope.selected_client = client.first_name + " " + client.last_name;
            $scope.tripDropdownDisabled = true;
            shipment.client = client;
            var query = new $kinvey.Query();
            query.equalTo('client._id',client._id);
            var promise = $kinvey.DataStore.find('shipment', query, {relations: { route: 'route'}});
            promise.then(
                function (response) {
                    $scope.trips = response;
                    $scope.tripDropdownDisabled= false;
                },
                function (error) {
                    console.log("Error get trips " + error.description);
                }
            );
        };

        $scope.cancelCreateClient = function () {
            $scope.isShowClientForm = false;
            $scope.hideClientButtons = false;
            if( $scope.selected_client !== "Select client") {
                $scope.showTripDropdown = true;
            }
        };

        $scope.selectTrip = function(trip, shipment){
            $scope.status.isTripsOpen = !$scope.status.isTripsOpen;
            shipment.route = trip.route;
        };

        $scope.saveDispatch = function(index,shipment,shipment_text){
            $scope.isEdit[index]=false;

            shipment.info = shipment_text;
            console.log("sipment inof " + shipment_text);
        };
    }]);

controllers.controller('ProfileEditController',
    ['$scope', '$kinvey', "$location","menuItem",function ($scope, $kinvey, $location,menuItem) {
        var item = menuItem.getItem();
        var activeUser = $kinvey.getActiveUser();
        switch (item.id){
            case 0:
                $scope.isBioFormShow = true;
                $scope.edit_title="Name";
                $scope.first_name = activeUser.first_name;
                $scope.last_name = activeUser.last_name;
                $scope.username = activeUser.username;
                break;
            case 1:
                $scope.isEmailFormShow = true;
                $scope.edit_title="Email";
                $scope.email = activeUser.email;
                break;
            case 2:
                $scope.isPasswordFormShow = true;
                $scope.edit_title="Password";
                break;
        }
        $scope.save = function () {
            switch (item.id){
                case 0:
                    var isFormInvalid = false;
                    if ($scope.bioForm.first_name.$error.required) {
                        $scope.submittedFirstName = true;
                        isFormInvalid = true;
                    } else {
                        $scope.submittedFirstName = false;
                    }
                    if ($scope.bioForm.last_name.$error.required) {
                        $scope.submittedLastName = true;
                        isFormInvalid = true;
                    } else {
                        $scope.submittedLastName = false;
                    }
                    if ($scope.bioForm.username.$error.required) {
                        $scope.submittedUsername = true;
                        isFormInvalid = true;
                    } else {
                        $scope.submittedUsername = false;
                    }
                    if (isFormInvalid) {
                        return;
                    }
                    activeUser.first_name = $scope.first_name;
                    activeUser.last_name = $scope.last_name;
                    activeUser.username = $scope.username;
                    var promise = $kinvey.User.update(activeUser);
                    promise.then(
                        function(){
                            $location.path("templates/main");
                        },
                        function(error){
                            console.log("error update user " + error.description);
                        }
                    );
                    break;
                case 1:
                    var isFormInvalid = false;
                    if ($scope.emailForm.email.$error.email || $scope.emailForm.email.$error.required) {
                        $scope.submittedEmail = true;
                        isFormInvalid = true;
                        return;
                    }else{
                        $scope.submittedEmail = false;
                    }
                    if (isFormInvalid) {
                        return;
                    }
                    activeUser.email = $scope.email;
                    var promise = $kinvey.User.update(activeUser);
                    promise.then(
                        function(){
                            $location.path("templates/main");
                        },
                        function(error){
                            console.log("error update user " + error.description);
                        }
                    );
                    break;
                case 2:
                    var isFormInvalid = false;
                    if ($scope.passwordForm.password.$error.required) {
                        $scope.submittedNewPassword = true;
                        isFormInvalid = true;
                    } else {
                        $scope.submittedNewPassword = false;
                    }
                    if ($scope.passwordForm.reconfirm_password.$error.required) {
                        $scope.submittedConfirmedPassword = true;
                        isFormInvalid = true;
                    } else {
                        $scope.submittedConfirmedPassword = false;
                    }
                    if (isFormInvalid) {
                        return;
                    }else if($scope.password !== $scope.reconfirm_password){
                        $scope.matchedPasswords = true;
                        return;
                    }
                    activeUser.password = $scope.password;
                    var promise = $kinvey.User.update(activeUser);
                    promise.then(
                        function(){
                            $location.path("templates/main");
                        },
                        function(error){
                            console.log("error update user " + error.description);
                        }
                    );
                    break;
            }

        };
        $scope.cancel = function () {
            $location.path("templates/main");
        }
    }]);


controllers.controller('NewDispatchController',
    ['$scope', '$kinvey', "$location","currentTrip", function ($scope, $kinvey, $location,currentTrip) {

        initPage();

        $scope.showClientForm = function () {
            $scope.isShowClientForm = true;
            $scope.hideClientButtons = true;
            $scope.showTripDropdown = false;
        }


        $scope.selectClient = function (id, name) {
            $scope.status.isopen = !$scope.status.isopen;
            $scope.selected_client = name;
            $scope.showTripDropdown = true;
            $scope.tripDropdownDisabled = true;
            console.log(id + " " + name);
            var query = new $kinvey.Query();
            query.equalTo('client._id', id);
            var promise = $kinvey.DataStore.find('shipment', query, {relations: { route: 'route'}});
            promise.then(
                function (response) {
                    $scope.trips = response;
                    $scope.tripDropdownDisabled= false;
                },
                function (error) {
                    console.log("Error get trips " + error.description);
                }
            );
        }
        $scope.createClient = function () {
            var isFormInvalid = false;
            $scope.submittedError = false;
            //check is form valid
            if ($scope.clientForm.first_name.$error.required) {
                $scope.submittedFirstName = true;
                isFormInvalid = true;
            } else {
                $scope.submittedFirstName = false;
            }
            if ($scope.clientForm.last_name.$error.required) {
                $scope.submittedLastName = true;
                isFormInvalid = true;
            } else {
                $scope.submittedLastName = false;
            }
            if (isFormInvalid) {
                return;
            }
            var promise = $kinvey.DataStore.save('clients', {
                first_name: $scope.first_name,
                last_name: $scope.last_name
            });
            promise.then(
                function (response) {
                    $scope.isShowClientForm = false;
                    $scope.hideClientButtons = false;
                    initPage();
                },
                function (error) {
                    $scope.submittedError = true;
                    $scope.errorDescription = error.description;
                }
            );
        }

        $scope.cancelCreateClient = function () {
            $scope.isShowClientForm = false;
            $scope.hideClientButtons = false;
            if( $scope.selected_client !== "Select client") {
                $scope.showTripDropdown = true;
            }
        }

        $scope.selectTrip = function(trip){
            currentTrip.setTrip(trip);
            $location.path("/templates/map");
        }

        function initPage() {
            $scope.selected_client = "Select client";
            $scope.selected_trip = "Select trip";
            $scope.status = {
                isopen: false
            };

            var promise = $kinvey.DataStore.find('clients', null);
            promise.then(
                function (response) {
                    $scope.clients = response;
                },
                function (error) {
                    console.log("get clients error " + error.description);
                }
            );
        }

    }]);

controllers.controller('MapController',
    ['$scope', '$kinvey', "$location", "currentTrip", function ($scope, $kinvey, $location, currentTrip) {
        var geocoder = new google.maps.Geocoder();
        var start_marker;
        var finish_marker;
        var center = {};
        var map;
        var directionsDisplay = new google.maps.DirectionsRenderer();
        directionsDisplay.setOptions({
            suppressMarkers: true
        });
        var directionsService = new google.maps.DirectionsService();
        var trip = currentTrip.getTrip();
        $scope.initialize = function () {
            var mapProp = {
                zoom: 14,
                disableDefaultUI: true
            };
            map = new google.maps.Map(document.getElementById("map"), mapProp);
            console.log("current trip " + JSON.stringify(currentTrip.getTrip()));
            geocoder.geocode({
                'address': trip.route.start
            }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    start_marker = new google.maps.Marker({
                        position: new google.maps.LatLng(results[0].geometry.location.k, results[0].geometry.location.A),
                        map: map,
                        icon: 'images/start_marker.png'
                    });
                    center.lat = results[0].geometry.location.k;
                    center.lon = results[0].geometry.location.A;
                    geocoder.geocode({
                        'address': trip.route.finish
                    }, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            finish_marker = new google.maps.Marker({
                                position: new google.maps.LatLng(results[0].geometry.location.k, results[0].geometry.location.A),
                                map: map,
                                icon: 'images/finish_marker.png'
                            });
                        }
                        map.setCenter(new google.maps.LatLng((center.lat + results[0].geometry.location.k) / 2,
                                (center.lon + results[0].geometry.location.A) / 2));
                        calcRoute();
                    });
                }
            });

            function calcRoute() {
                var request = {
                    origin: new google.maps.LatLng(start_marker.getPosition().k, start_marker.getPosition().A),
                    destination: new google.maps.LatLng(finish_marker.getPosition().k, finish_marker.getPosition().A),
                    travelMode: google.maps.DirectionsTravelMode.DRIVING
                };
                directionsService.route(request, function (response, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        current_direction_route = response;
                        directionsDisplay.setDirections(response);
                        directionsDisplay.setMap(map);
                    }
                });
            }

            $scope.acceptTrip = function () {
                //Todo add functionality
            }

            $scope.cancelTrip = function () {
                $location.path("temlates/new_dispatch");
            }

        }
    }]);

