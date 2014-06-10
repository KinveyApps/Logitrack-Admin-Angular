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
    ['$scope', '$kinvey', "$location","$modal","menuItem", function ($scope, $kinvey, $location,$modal,menuItem) {


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
            var modalInstance = $modal.open({
                templateUrl: 'profile_edit.html',
                controller: ProfileEditController,
                size: "",
                resolve: {
                    menuItem: function () {
                        return menuItem;
                    }
                }
            });
        };
    }]);

var ProfileEditController = function ($scope, $modalInstance, $kinvey,menuItem) {

    var item = menuItem.getItem();
    var activeUser = $kinvey.getActiveUser();
    $scope.bioForm = {};
    $scope.emailForm={};
    $scope.passwordForm = {};
   $scope.user = {};
    switch (item.id){
        case 0:
            $scope.isBioFormShow = true;
            $scope.edit_title="Name";
            $scope.user.first_name = activeUser.first_name;
            $scope.user.last_name = activeUser.last_name;
            $scope.user.username = activeUser.username;
            break;
        case 1:
            $scope.isEmailFormShow = true;
            $scope.edit_title="Email";
            $scope.user.email = activeUser.email;
            break;
        case 2:
            $scope.isPasswordFormShow = true;
            $scope.edit_title="Password";
            break;
    }
    $scope.save = function () {
        switch (item.id){
            case 0:
                console.log("first name " + $scope.user.last_name);
                var isFormInvalid = false;
                if ($scope.bioForm.scope.first_name.$error.required) {
                    $scope.submittedFirstName = true;
                    isFormInvalid = true;
                } else {
                    $scope.submittedFirstName = false;
                }
                if ($scope.bioForm.scope.last_name.$error.required) {
                    $scope.submittedLastName = true;
                    isFormInvalid = true;
                } else {
                    $scope.submittedLastName = false;
                }
                if ($scope.bioForm.scope.username.$error.required) {
                    $scope.submittedUsername = true;
                    isFormInvalid = true;
                } else {
                    $scope.submittedUsername = false;
                }
                if (isFormInvalid) {
                    return;
                }
                activeUser.first_name = $scope.user.first_name;
                activeUser.last_name = $scope.user.last_name;
                activeUser.username = $scope.user.username;
                console.log("check user name " + $scope.user.username);
                var promise = $kinvey.User.update(activeUser);
                promise.then(
                    function(){
                        $modalInstance.close();
                    },
                    function(error){
                        console.log("error update user " + error.description);
                    }
                );
                break;
            case 1:
                var isFormInvalid = false;
                if ($scope.emailForm.scope.email.$error.email || $scope.emailForm.scope.email.$error.required) {
                    $scope.submittedEmail = true;
                    isFormInvalid = true;
                    return;
                }else{
                    $scope.submittedEmail = false;
                }
                if (isFormInvalid) {
                    return;
                }
                activeUser.email = $scope.user.email;
                var promise = $kinvey.User.update(activeUser);
                promise.then(
                    function(){
                        $modalInstance.close();
                    },
                    function(error){
                        console.log("error update user " + error.description);
                    }
                );
                break;
            case 2:
                var isFormInvalid = false;
                if ($scope.passwordForm.scope.password.$error.required) {
                    $scope.submittedNewPassword = true;
                    isFormInvalid = true;
                } else {
                    $scope.submittedNewPassword = false;
                }
                if ($scope.passwordForm.scope.reconfirm_password.$error.required) {
                    $scope.submittedConfirmedPassword = true;
                    isFormInvalid = true;
                } else {
                    $scope.submittedConfirmedPassword = false;
                }
                if (isFormInvalid) {
                    return;
                }else if($scope.user.password !== $scope.user.reconfirm_password){
                    $scope.matchedPasswords = true;
                    return;
                }
                console.log("passwords " + $scope.user.password + ",," + $scope.user.reconfirm_password);
                activeUser.password = $scope.user.password;
                var promise = $kinvey.User.update(activeUser);
                promise.then(
                    function(){
                        $modalInstance.close();
                    },
                    function(error){
                        console.log("error update user " + error.description);
                    }
                );
                break;
        }

    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};


controllers.controller('DispatchController',
    ['$scope', '$kinvey', "$location","$modal","currentTrip",function ($scope, $kinvey, $location,$modal,currentTrip) {
        $scope.initPage = function(){
            $scope.isEdit=[];
            $scope.isClientsOpen=[];
            $scope.isDriversOpen=[];
            $scope.isTripsOpen=[];
            var promise = $kinvey.DataStore.find('shipment', null, {relations: { route:"route",
                client:"clients",
                driver:"user"}});
            $scope.tripDropdownDisabled = [];
            $scope.trips = [];
            promise.then(
                function (response) {
                    $scope.new_shipments = [];
                    $scope.open_shipments = [];
                    $scope.progress_shipments = [];
                    for (var i in response) {
                        switch (response[i].user_status){
                            case "new":
                                $scope.isClientsOpen.push(false);
                                $scope.isDriversOpen.push(false);
                                $scope.isTripsOpen.push(false);
                                $scope.tripDropdownDisabled.push(true);
                                $scope.trips.push({});
                                $scope.new_shipments.push(response[i]);
                                setFormatDateTime(response[i]);
                                break;
                            case "open":
                                $scope.open_shipments.push(response[i]);
                                setFormatDateTime(response[i]);
                                break;
                            case "in progress":
                                $scope.progress_shipments.push(response[i]);
                                setFormatDateTime(response[i]);
                                break;
                        }

                    }
                    console.log(response[0]);
                },
                function (error) {
                    console.log("get shipment error " + JSON.stringify(error.description));
                }
            );
            var query = new $kinvey.Query();
            query.equalTo('status', 'driver');
            var promise = $kinvey.User.find(query);
            promise.then(
                function (response) {
                    console.log("get drivers success");
                    $scope.drivers = response;
                },
                function(error){
                    console.log("get drivers error " + error.description);
                });
        };

        $scope.selectDriver = function(driver,index){
            $scope.isDriversOpen[index] = !$scope.isDriversOpen[index];
            console.log(JSON.stringify(driver));
            $scope.new_shipments[index].driver = driver;
        };

        $scope.createNewDispatch = function () {
            $scope.clients =[];
            $scope.new_shipments.unshift({user_status:"new"});
            $scope.isEdit.unshift(true);
            $scope.isClientsOpen.unshift(false);
            $scope.isDriversOpen.unshift(false);
            $scope.isTripsOpen.unshift(false);
            $scope.trips.unshift({});
            $scope.tripDropdownDisabled.unshift(true);
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

        $scope.selectClient = function (client,shipment,index) {
            console.log("selected index " + index);
            $scope.isClientsOpen[index] = !$scope.isClientsOpen[index];
            $scope.selected_client = client.first_name + " " + client.last_name;
            $scope.tripDropdownDisabled[index] = true;
            shipment.client = client;
            var query = new $kinvey.Query();
            query.equalTo('client._id',client._id);
            var promise = $kinvey.DataStore.find('shipment', query, {relations: { route: 'route'}});
            promise.then(
                function (response) {
                    $scope.trips[index] = response;
                    console.log("trips " + JSON.stringify($scope.trips));
                    $scope.tripDropdownDisabled[index]= false;
                },
                function (error) {
                    console.log("Error get trips " + error.description);
                }
            );
        };

        $scope.selectTrip = function(trip,shipment,index){
            $scope.isTripsOpen[index] = !$scope.isTripsOpen[index];
            shipment.route = trip.route;
        };

        $scope.editDispatch = function(index){
            $scope.isEdit[index]=true;
        };

        $scope.saveDispatch = function(index){
            $scope.isEdit[index]=false;
        };

        $scope.cancelDispatch = function(index){
            console.log("is edit " + $scope.isEdit);
            $scope.new_shipments.splice(index,1);
            $scope.isClientsOpen.splice(index,1);
            $scope.isDriversOpen.splice(index,1);
            $scope.isTripsOpen.splice(index,1);
            $scope.tripDropdownDisabled.splice(index,1);
            $scope.trips.splice(index,1);
            $scope.isEdit.splice(index,1);
            console.log("is edit " + $scope.isEdit);
        };

        $scope.startDispatch = function(index,shipment){
            $scope.isEdit[index]=false;
            delete shipment.date;
            delete shipment.request_time;
            shipment.user_status = "open";
            var promise = $kinvey.DataStore.save("shipment",shipment,{relations: { route: 'route',
                client: "clients",
                driver:"user"}});
            promise.then(
                function(responce){
                    console.log("update shipment success " + JSON.stringify(responce));
                    $scope.new_shipments.splice(index,1);
                    $scope.open_shipments.unshift(responce);
                    setFormatDateTime(responce);
                },
                function(error){
                    console.log("update shipment error " + error.description);
                }
            );
        };

        $scope.viewRoute = function(shipment){
                currentTrip.setTrip(shipment);
                var modalInstance = $modal.open({
                    templateUrl: 'map.html',
                    controller: MapController,
                    size: "lg",
                    resolve: {
                        currentTrip: function () {
                            return currentTrip;
                        }
                    }
                });
        };

        var setFormatDateTime=function(shipment){
            var monthNames = [ "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December" ];
            var milis = Date.parse(shipment._kmd.lmt);
            var date = new Date(milis);
            shipment.date = monthNames[date.getMonth()] + " " + date.getDate() +", " + date.getFullYear();
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0'+minutes : minutes;
            var strTime = hours + ':' + minutes + ' ' + ampm;
           shipment.request_time = strTime;
        };

    }]);

var MapController = function ($scope, $kinvey, $location,$modalInstance, currentTrip) {
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
        console.log("iniz");
        var mapProp = {
            zoom: 14,
            disableDefaultUI: true
        };
        if (!map) {
            console.log("map create " + map + " ");
            map = new google.maps.Map(document.getElementById("map"), mapProp);
        }
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
        window.setTimeout(function(){
            google.maps.event.trigger(map, 'resize');
        },100);
    };
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
            $modalInstance.dismiss();
        };
};


