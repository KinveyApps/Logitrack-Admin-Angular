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

controllers.controller('LoginController',
    ['$scope', '$kinvey', "$location", function ($scope, $kinvey, $location) {
        //Kinvey login starts
        $scope.login = function () {
            var isFormInvalid = false;
            $scope.submittedError = false;
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
                    if (response.status === "admin") {
                        $scope.submittedError = false;
                        $location.path('/templates/main');
                    }
                    else {
                        $scope.submittedError = true;
                        $scope.errorDescription = "You don't have required permissions";
                        var promise = $kinvey.User.logout();
                        promise.then(
                            function () {
                                console.log("Sign out with success");
                            },
                            function (error) {
                                console.log("Sign out error " + error.description);
                            }
                        );
                    }
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
        $scope.resetPassword = function () {
            console.log("click reset");
            if ($scope.resetPasswordForm.email.$error.email || $scope.resetPasswordForm.email.$error.required) {
                $scope.submittedEmail = true;
                return;
            } else {
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
        $scope.signUp = function () {
            var isFormInvalid = false;
            $scope.submittedError = false;
            //check is form valid
            if ($scope.signUpForm.first_name.$error.required) {
                $scope.submittedFirstName = true;
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
            } else {
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
                mobile_number: $scope.telephone_number,
                status: "admin"
            });
            console.log("signup promise");
            promise.then(
                function () {
                    //Kinvey signup finished with success
                    $scope.submittedError = false;
                    console.log("signup success");
                    $location.path("/templates/main");
                },
                function (error) {
                    //Kinvey signup finished with error
                    $scope.submittedError = true;
                    $scope.errorDescription = error.description;
                    console.log("signup error: " + error.description);
                }
            );
        }
    }]);

controllers.controller('MainController',
    ['$scope', '$kinvey', "$location", "$modal", function ($scope, $kinvey, $location, $modal) {
        $scope.selectedTab = 0;
        $scope.status = {};
        status.isopen = false;
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

        $scope.signOut = function () {
            var user = $kinvey.getActiveUser();
            if (null !== user) {
                var promise = $kinvey.User.logout();
                promise.then(
                    function () {
                        $location.path("templates/login");
                    },
                    function (error) {
                        console.log("Sign out error " + error.description);
                    }
                );
            }
        };

        $scope.changeProfile = function (item) {
            var modalInstance = $modal.open({
                templateUrl: 'profile_edit.html',
                controller: ProfileEditController,
                size: "",
                resolve: {
                    item: function () {
                        return item;
                    }
                }
            });
        };

        $scope.dispatchClick = function(){
            $scope.$broadcast('UPDATE_CLIENTS');
        };

        $scope.selectManageItem = function ($event, index) {
            $scope.selectedManageItem = index;
            $scope.selectedTab = 2;
            $event.preventDefault();
            $event.stopPropagation();
            $scope.status.isopen = !$scope.status.isopen;
        }
    }]);

var ProfileEditController = function ($scope, $modalInstance, $kinvey, item) {

    var activeUser = $kinvey.getActiveUser();
    $scope.bioForm = {};
    $scope.emailForm = {};
    $scope.passwordForm = {};
    $scope.user = {};
    switch (item.id) {
        case 0:
            $scope.isBioFormShow = true;
            $scope.edit_title = "Name";
            $scope.user.first_name = activeUser.first_name;
            $scope.user.last_name = activeUser.last_name;
            $scope.user.username = activeUser.username;
            break;
        case 1:
            $scope.isEmailFormShow = true;
            $scope.edit_title = "Email";
            $scope.user.email = activeUser.email;
            break;
        case 2:
            $scope.isPasswordFormShow = true;
            $scope.edit_title = "Password";
            break;
    }
    $scope.save = function () {
        var isFormInvalid = false;
        switch (item.id) {
            case 0:
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
                    function () {
                        $modalInstance.close();
                    },
                    function (error) {
                        console.log("error update user " + error.description);
                    }
                );
                break;
            case 1:
                if ($scope.emailForm.scope.email.$error.email || $scope.emailForm.scope.email.$error.required) {
                    $scope.submittedEmail = true;
                    isFormInvalid = true;
                    return;
                } else {
                    $scope.submittedEmail = false;
                }
                if (isFormInvalid) {
                    return;
                }
                activeUser.email = $scope.user.email;
                var promise = $kinvey.User.update(activeUser);
                promise.then(
                    function () {
                        $modalInstance.close();
                    },
                    function (error) {
                        console.log("error update user " + error.description);
                    }
                );
                break;
            case 2:
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
                } else if ($scope.user.password !== $scope.user.reconfirm_password) {
                    $scope.matchedPasswords = true;
                    return;
                }
                console.log("passwords " + $scope.user.password + ",," + $scope.user.reconfirm_password);
                activeUser.password = $scope.user.password;
                var promise = $kinvey.User.update(activeUser);
                promise.then(
                    function () {
                        $modalInstance.close();
                    },
                    function (error) {
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
    ['$scope', '$kinvey', "$location", "$modal", function ($scope, $kinvey, $location, $modal) {
        $scope.initPage = function () {
            $scope.isEdit = [];
            $scope.isClientsOpen = [];
            $scope.isDriversOpen = [];
            $scope.isTripsOpen = [];
            $scope.tripDropdownDisabled = [];
            $scope.isSubmittedClient = [];
            $scope.isSubmittedRoute = [];
            $scope.isSubmittedDriver = [];
            $scope.isSubmittedShipmentName = [];
            $scope.isShipmentNameOpen = [];
            $scope.isShipmentNameSelected = [];
            var promise = $kinvey.DataStore.find('shipment', null, {relations: { route: "route",
                client: "clients",
                driver: "user",
                info: "shipment-info"}});
            $scope.trips = [];
            promise.then(
                function (response) {
                    $scope.new_shipments = [];
                    $scope.open_shipments = [];
                    $scope.progress_shipments = [];
                    for (var i in response) {
                        switch (response[i].user_status) {
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
            getClients();
            getShipmentInfos();
            var query = new $kinvey.Query();
            query.equalTo('status', 'driver');
            var promise = $kinvey.User.find(query);
            promise.then(
                function (response) {
                    console.log("get drivers success");
                    $scope.drivers = response;
                },
                function (error) {
                    console.log("get drivers error " + error.description);
                });
        };

        $scope.$on('UPDATE_CLIENTS', function() {
           getClients();
        });

        $scope.selectDriver = function (driver, index) {
            $scope.isDriversOpen[index] = !$scope.isDriversOpen[index];
            console.log(JSON.stringify(driver));
            $scope.new_shipments[index].driver = driver;
        };

        $scope.createNewDispatch = function () {
            getClients();
            getShipmentInfos();
            $scope.new_shipments.unshift({user_status: "new"});
            $scope.isEdit.unshift(true);
            $scope.isClientsOpen.unshift(false);
            $scope.isDriversOpen.unshift(false);
            $scope.isTripsOpen.unshift(false);
            $scope.isShipmentNameOpen.unshift(false);
            $scope.isShipmentNameSelected.unshift(false);
            $scope.trips.unshift({});
            $scope.tripDropdownDisabled.unshift(true);
            $scope.selected_client = "Select client";
            $scope.selected_trip = "Select trip";
        };

        $scope.selectClient = function (client, shipment, index) {
            console.log("selected index " + index);
            $scope.isClientsOpen[index] = !$scope.isClientsOpen[index];
            $scope.selected_client = client.first_name + " " + client.last_name;
            $scope.tripDropdownDisabled[index] = true;
            shipment.client = client;
            var query = new $kinvey.Query();
            query.equalTo('client._id', client._id);
            query.equalTo('user_status', "new");
            var promise = $kinvey.DataStore.find('shipment', query, {relations: { route: 'route'}});
            promise.then(
                function (response) {
                    shipment.route = undefined;
                    $scope.trips = [];
                    for (var i in response) {
                        if (!response[i].route.isInTrash) {
                            if($scope.trips[index] === undefined){
                                $scope.trips[index] = [];
                            }
                            $scope.trips[index].push(response[i]);
                        }
                    }
                    $scope.tripDropdownDisabled[index] = false;
                },
                function (error) {
                    console.log("Error get trips " + error.description);
                }
            );
        };

        $scope.selectTrip = function (trip, shipment, index) {
            $scope.isTripsOpen[index] = !$scope.isTripsOpen[index];
            shipment.route = trip.route;
        };

        $scope.selectShipmentName = function(shipment,info,index){
            $scope.isShipmentNameOpen[index]=!$scope.isShipmentNameOpen[index];
            $scope.isShipmentNameSelected[index] = true;
            shipment.info = info;
        };

        $scope.editDispatch = function (index) {
            $scope.isEdit[index] = true;
        };

        $scope.saveDispatch = function (index, shipment) {
            var isFormInvalid = false;
            if (!shipment.driver) {
                $scope.isSubmittedDriver[index] = true;
                isFormInvalid = true;
            } else {
                $scope.isSubmittedDriver[index] = false;
            }
            if (!shipment.client) {
                $scope.isSubmittedClient[index] = true;
                isFormInvalid = true;
            } else {
                $scope.isSubmittedClient[index] = false;
            }
            if (!shipment.route) {
                $scope.isSubmittedRoute[index] = true;
                isFormInvalid = true;
            } else {
                $scope.isSubmittedRoute[index] = false;
            }
            if(!shipment.info){
                $scope.isSubmittedShipmentName[index] = true;
                isFormInvalid = true;
            }else{
                $scope.isSubmittedShipmentName[index] = false;
            }
            if (isFormInvalid) {
                return;
            }
            $scope.isEdit[index] = false;
        };

        $scope.cancelDispatch = function (index) {
            console.log("is edit " + $scope.isEdit);
            $scope.new_shipments.splice(index, 1);
            $scope.isClientsOpen.splice(index, 1);
            $scope.isDriversOpen.splice(index, 1);
            $scope.isTripsOpen.splice(index, 1);
            $scope.tripDropdownDisabled.splice(index, 1);
            $scope.isShipmentNameOpen.splice(index, 1);
            $scope.isShipmentNameSelected.splice(index, 1);
            $scope.trips.splice(index, 1);
            $scope.isEdit.splice(index, 1);
            console.log("is edit " + $scope.isEdit);
        };

        $scope.startDispatch = function (index, shipment) {
            $scope.isEdit[index] = false;
            delete shipment.date;
            delete shipment.request_time;
            shipment.user_status = "open";
            var promise = $kinvey.DataStore.save("shipment", shipment, {relations: { route: 'route',
                client: "clients",
                driver: "user",
                info:"shipment-info"}});
            promise.then(
                function (responce) {
                    console.log("update shipment success " + JSON.stringify(responce));
                    $scope.new_shipments.splice(index, 1);
                    $scope.open_shipments.unshift(responce);
                    setFormatDateTime(responce);
                },
                function (error) {
                    console.log("update shipment error " + error.description);
                }
            );
        };

        $scope.viewRoute = function (shipment) {
            var modalInstance = $modal.open({
                templateUrl: 'map.html',
                controller: MapController,
                size: "lg",
                resolve: {
                    currentTrip: function () {
                        return shipment;
                    }
                }
            });
        };

        var getClients = function () {
            $scope.clients = [];
            var query = new $kinvey.Query();
            query.equalTo('user_status', 'new');
            var promise = $kinvey.DataStore.find('shipment', query, {relations: {client: "clients",route:"route"}});
            promise.then(
                function (response) {
                    console.log("get client success " + response.length);
                    console.log("clients " + JSON.stringify(response));
                    for (var i in response) {
                        if(!response[i].route.isInTrash && !response[i].client.isInTrash) {
                            if (!isItemExistInArray(response[i].client,$scope.clients)) {
                                $scope.clients.push(response[i].client);
                            }
                        }
                    }
                },
                function (error) {
                    console.log("get clients error " + error.description);
                }
            );
        };

        var getShipmentInfos = function(){
          $scope.shipment_infos =[];
            var promise = $kinvey.DataStore.find('shipment-info', null);
            promise.then(
                function (response) {
                    console.log("get shipment-info success");
                    $scope.shipment_infos = response;
                },
                function (error) {
                    console.log("get shipment-info error " + error.description);
                }
            );
        };

        var setFormatDateTime = function (shipment) {
            var monthNames = [ "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December" ];
            var milis = Date.parse(shipment._kmd.lmt);
            var date = new Date(milis);
            shipment.date = monthNames[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;
            shipment.request_time = hours + ':' + minutes + ' ' + ampm;
        };
    }]);

controllers.controller('LogisticsController',
    ['$scope', '$kinvey', "$modal", function ($scope, $kinvey, $modal) {
        var query = new $kinvey.Query();
        query.equalTo('user_status', 'in progress');
        var promise = $kinvey.DataStore.find('shipment', query, {relations: { route: "route",
            client: "clients",
            driver: "user",
            info:"shipment-info"}});
        promise.then(function (response) {
            $scope.shipments = response;
            console.log("responce " + JSON.stringify(response));
        }, function (error) {
            console.log("get shipment error " + error.description);
        });

        $scope.getTime = function (time_data) {
            var milis = Date.parse(time_data);
            var date = new Date(milis);
            var hours = date.getHours();
            hours = hours < 10 ? '0' + hours : hours;
            var minutes = date.getMinutes();
            minutes = minutes < 10 ? '0' + minutes : minutes;
            var seconds = date.getSeconds();
            seconds = seconds < 10 ? '0' + seconds : seconds;
            return hours + ":" + minutes + ":" + seconds;
        };

        $scope.showTripDetails = function (shipment, index) {
            var modalInstance = $modal.open({
                templateUrl: 'trip_details.html',
                controller: TripDetailsController,
                size: "lg",
                resolve: {
                    shipment: function () {
                        return shipment;
                    }
                }
            });
        };
    }]);

var MapController = function ($scope, $kinvey, $location, $modalInstance, currentTrip) {
    var start_marker;
    var finish_marker;
    var map;
    var shape_paths = [];
    var markers=[];
    var directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setOptions({
        suppressMarkers: true
    });
    var directionsService = new google.maps.DirectionsService();
    $scope.initialize = function () {
        $scope.isShape = false;
        var mapProp = {
            zoom: 14,
            center: new google.maps.LatLng((currentTrip.route.start_lat + currentTrip.route.finish_lat) / 2, (currentTrip.route.start_long + currentTrip.route.finish_long) / 2)
        };
        if (!map) {
            console.log("map create " + map + " ");
            map = new google.maps.Map(document.getElementById("route_map"), mapProp);
        }
        console.log("current trip " + JSON.stringify(currentTrip));
        start_marker = new google.maps.Marker({
            position: new google.maps.LatLng(currentTrip.route.start_lat, currentTrip.route.start_long),
            map: map,
            icon: 'images/start_marker.png'
        });
//        var populationOptions = {
//            strokeColor: '#FF0000',
//            strokeOpacity: 0.8,
//            strokeWeight: 2,
//            fillColor: '#FF0000',
//            fillOpacity: 0.35,
//            map: map,
//            center: start_marker.getPosition(),
//            radius: 1000,
//            draggable:true,
//            editable:true
//        };
//        // Add the circle for this city to the map.
//        circle = new google.maps.Circle(populationOptions);
//        google.maps.event.addListener(circle, 'dragend', function() {
//            alert("drag end");
//        });

        // Construct the polygon.


        google.maps.event.addListener(map, 'click', function (event) {
            createShapePath(event.latLng);
        });
        finish_marker = new google.maps.Marker({
            position: new google.maps.LatLng(currentTrip.route.finish_lat, currentTrip.route.finish_long),
            map: map,
            icon: 'images/finish_marker.png'
        });
        calcRoute();
        window.setTimeout(function () {
            google.maps.event.trigger(map, 'resize');
        }, 100);
    };

    $scope.createShape = function () {
        for (var i in markers) {
            markers[i].setMap(null);
        }
        shape_paths.push(shape_paths[0]);
        shape = new google.maps.Polygon({
            paths: shape_paths,
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            draggable: true,
            editable: true
        });
        shape.setMap(map);
        $scope.isShape = false;
        google.maps.event.clearListeners(map, 'click');
        console.log("is shape contain start marker: " + (google.maps.geometry.poly.containsLocation(start_marker.getPosition(), shape)));
    };

    function createShapePath(location){
        shape_paths.push(location);
        var marker = new google.maps.Marker({
            position: location,
            map: map
        });
        markers.push(marker);
        if(shape_paths.length>2){
            $scope.isShape = true;
        }
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

var TripDetailsController = function ($scope, $kinvey, $location, $modalInstance, shipment) {

    var start_marker;
    var finish_marker;
    var user_marker;
    var map;
    var directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setOptions({
        suppressMarkers: true
    });
    var directionsService = new google.maps.DirectionsService();
    $scope.initialize = function () {
        var mapProp = {
            zoom: 14,
            center: new google.maps.LatLng((shipment.route.start_lat + shipment.route.finish_lat) / 2, (shipment.route.start_long + shipment.route.finish_long) / 2)
        };
        if (!map) {
            console.log("map create " + map + " ");
            map = new google.maps.Map(document.getElementById("checkin_map"), mapProp);
        }
        start_marker = new google.maps.Marker({
            position: new google.maps.LatLng(shipment.route.start_lat, shipment.route.start_long),
            map: map,
            icon: 'images/start_marker.png'
        });
        finish_marker = new google.maps.Marker({
            position: new google.maps.LatLng(shipment.route.finish_lat, shipment.route.finish_long),
            map: map,
            icon: 'images/finish_marker.png'
        });
        user_marker = new google.maps.Marker({
            position: new google.maps.LatLng(shipment.driver.position.lat, shipment.driver.position.lon),
            map: map,
            icon: 'images/user_marker.png'
        });
        var query = new $kinvey.Query();
        query.equalTo('shipment_id', shipment._id);
        console.log(shipment._id);
        var promise = $kinvey.DataStore.find('shipment-checkins', query);
        promise.then(function (response) {
                $scope.checkins = response;
                for (var i in response) {
                    new google.maps.Marker({
                        position: new google.maps.LatLng(response[i].position.lat, response[i].position.lon),
                        map: map
                    });
                }
            },
            function (error) {
                console.log("checins error " + error.description);
            });
        window.setTimeout(function () {
            google.maps.event.trigger(map, 'resize');
        }, 100);
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

    $scope.clickMapTab = function () {
        calcRoute();
        map.setCenter(new google.maps.LatLng((shipment.route.start_lat + shipment.route.finish_lat) / 2, (shipment.route.start_long + shipment.route.finish_long) / 2));
        window.setTimeout(function () {
            google.maps.event.trigger(map, 'resize');
        }, 100);
    };

    $scope.closeTripDetails = function () {
        $modalInstance.dismiss();
    };
};

controllers.controller('ManageTripsController',
    ['$scope', '$kinvey', "$modal", function ($scope, $kinvey, $modal) {

        var getClients = function () {
            $scope.clients = [];
            var query = new $kinvey.Query();
            var promise = $kinvey.DataStore.find('clients', null);
            promise.then(
                function (response) {
                    $scope.clients = response;
                    console.log($scope.clients);
                },
                function (error) {
                    console.log("get clients error " + error.description);
                }
            );
        };
        $scope.isEdit = [];
        $scope.trips = [];
        $scope.archived_trips = [];
        $scope.isClientsOpen = [];
        $scope.isSubmittedClient = [];
        $scope.isSubmittedRoute = [];
        $scope.isRoute = [];
        $scope.routeBtnText = [];
        $scope.isEditPermissions = [];
        $scope.isShowArchived=false;
        getClients();
        var promise = $kinvey.DataStore.find('shipment', null, {relations: {route: "route", client: "clients"}});
        promise.then(function (response) {
            for (var i in response) {
                if (!response[i].route.isInTrash) {
                    if (!isTripExistInArray(response[i], $scope.trips)) {
                        $scope.trips.push(response[i]);
                        $scope.isRoute.push(true);
                        $scope.routeBtnText.push("Edit route");
                        if(response[i].user_status == "new"){
                            $scope.isEditPermissions.push(true);
                        }else{
                            $scope.isEditPermissions.push(false);
                        }
                    }
                } else {
                    if (!isTripExistInArray(response[i], $scope.archived_trips)) {
                        $scope.archived_trips.push(response[i]);
                        $scope.isShowArchived = true;
                    }
                }
            }
        }, function (error) {
            console.log("get trips with error " + error.description);
        });

        $scope.deleteTrip = function (index, trip) {
            $scope.archived_trips.splice(index, 1);
            var promise = $kinvey.DataStore.destroy('shipment', trip._id);
            promise.then(function (response) {
                console.log("delete trip with success");
            }, function (error) {
                console.log("delete trip with error " + error.description);
            });
            if($scope.archived_trips.length===0){
                $scope.isShowArchived = false;
            }
        };

        $scope.archiveTrip = function (index, trip) {
            if($scope.archived_trips.length===0){
                $scope.isShowArchived = true;
            }
            trip.route.isInTrash = true;
            $scope.trips.splice(index, 1);
            $scope.isClientsOpen.splice(index, 1);
            $scope.isEdit.splice(index, 1);
            $scope.isSubmittedClient.splice(index, 1);
            $scope.isSubmittedRoute.splice(index, 1);
            $scope.isRoute.splice(index, 1);
            $scope.routeBtnText.splice(index, 1);
            $scope.isEditPermissions.splice(index,1);

            $scope.archived_trips.unshift(trip);
            saveTripOnKinvey(JSON.parse(JSON.stringify(trip)));
        };

        $scope.restoreTrip = function(index,trip){
            trip.route.isInTrash = false;
            $scope.archived_trips.splice(index, 1);

            $scope.trips.unshift(trip);
            $scope.isEdit.unshift(false);
            $scope.isClientsOpen.unshift(false);
            $scope.isSubmittedClient.unshift(false);
            $scope.isSubmittedRoute.unshift(false);
            $scope.isRoute.unshift(true);
            $scope.isEditPermissions.unshift(true);
            $scope.routeBtnText.unshift("Edit route");
            if($scope.archived_trips.length === 0){
                $scope.isShowArchived = false;
            }
            getClients();
            saveTripOnKinvey(JSON.parse(JSON.stringify(trip)));
        };

        $scope.restoreAllTrips = function () {
            var length = $scope.archived_trips.length;
            var i = 0;
            while (i < length) {
                $scope.restoreTrip(0, $scope.archived_trips[0]);
                i++;
            }
        };

        $scope.deleteAllTrips = function () {
            var length = $scope.archived_trips.length;
            var i = 0;
            while (i < length) {
                $scope.deleteTrip(0, $scope.archived_trips[0]);
                i++;
            }
        };

        $scope.addNewTrip = function () {
            $scope.trips.unshift({});
            $scope.isEdit.unshift(true);
            $scope.isClientsOpen.unshift(false);
            $scope.isSubmittedClient.unshift(false);
            $scope.isSubmittedRoute.unshift(false);
            $scope.isRoute.unshift(false);
            $scope.isEditPermissions.unshift(true);
            $scope.routeBtnText.unshift("Select route");
            getClients();
        };

        $scope.editTrip = function (index) {
            $scope.isEdit[index] = !$scope.isEdit[index];
        };

        $scope.saveTrip = function (index, trip) {
            var isFormInvalid = false;
            console.log();
            if (!trip.client) {
                $scope.isSubmittedClient[index] = true;
                isFormInvalid = true;
            } else {
                $scope.isSubmittedClient[index] = false;
            }
            if (!trip.route) {
                $scope.isSubmittedRoute[index] = true;
                isFormInvalid = true;
            } else {
                $scope.isSubmittedRoute[index] = false;
            }
            if (isFormInvalid) {
                return;
            }
            $scope.isEdit[index] = !$scope.isEdit[index];
            var savedTrip = JSON.parse(JSON.stringify(trip));
            savedTrip.user_status = "new";
            saveTripOnKinvey(savedTrip);
        };

        $scope.cancelTrip = function(index){
            $scope.trips.splice(index, 1);
            $scope.isClientsOpen.splice(index, 1);
            $scope.isEdit.splice(index, 1);
            $scope.isSubmittedClient.splice(index, 1);
            $scope.isSubmittedRoute.splice(index, 1);
            $scope.isRoute.splice(index, 1);
            $scope.routeBtnText.splice(index, 1);
            $scope.isEditPermissions.splice(index,1);
        };

        $scope.selectClient = function (client, trip, index) {
            $scope.isClientsOpen[index] = !$scope.isClientsOpen[index];
            trip.client = client;
        };

        $scope.viewTrip = function (trip) {
            var modalInstance = $modal.open({
                templateUrl: 'map.html',
                controller: MapController,
                size: "lg",
                resolve: {
                    currentTrip: function () {
                        return trip;
                    }
                }
            });
        };

        $scope.duplicateTrip = function (index) {
            var duplicatedTrip = JSON.parse(JSON.stringify($scope.trips[index]));
            delete duplicatedTrip._id;
            delete duplicatedTrip.route._id;
            duplicatedTrip.user_status = "new";
            var promise = $kinvey.DataStore.save("shipment", duplicatedTrip, {relations: { route: 'route',
                client: "clients" }});
            promise.then(
                function (responce) {
                    $scope.trips.splice(index, 0, responce);
                    $scope.isEdit.splice(index, 0, false);
                    $scope.isClientsOpen.splice(index, 0, false);
                    $scope.isSubmittedClient.splice(index, 0, false);
                    $scope.isSubmittedRoute.splice(index, 0, false);
                    $scope.isRoute.splice(index, 0, true);
                    $scope.routeBtnText.splice(index, 0, "Select route");
                    $scope.isEditPermissions.splice(index,0,true);
                    getClients();
                },
                function (error) {
                    console.log("update trip error " + error.description);
                }
            );
        };

        $scope.selectRoute = function (trip, index) {
            var modalInstance = $modal.open({
                templateUrl: 'route_create_map.html',
                controller: RouteCreateController,
                size: "lg",
                resolve: {
                    currentTrip: function () {
                        return trip;
                    }
                }
            });

            modalInstance.result.then(function (route) {
                trip.route = route;
                if (route != undefined) {
                    $scope.isRoute[index] = true;
                    $scope.isSubmittedRoute[index] = false;
                    $scope.routeBtnText[index] = "Edit route";
                }
                console.log("route " + JSON.stringify(trip.route));
            });
        };

        var isTripExistInArray = function (trip, array) {
            for (var i in array) {
                if (array[i].route._id == trip.route._id) {
                    return true;
                }
            }
            return false;
        };


        var saveTripOnKinvey = function(trip){
            var promise = $kinvey.DataStore.save("shipment", trip, {relations: { route: 'route',
                client: "clients" }});
            promise.then(
                function (responce) {
                    console.log("update shipment success " + JSON.stringify(responce));
                },
                function (error) {
                    console.log("update shipment error " + error.description);
                }
            );
        };
    }]);


var RouteCreateController = function ($scope, $kinvey, $location, $timeout, $modalInstance, currentTrip) {
    var start_marker;
    var finish_marker;
    var map;
    console.log("current trip " + JSON.stringify(currentTrip));
    var geocoder = new google.maps.Geocoder();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setOptions({
        suppressMarkers: true
    });
    var directionsService = new google.maps.DirectionsService();
    $scope.initialize = function () {
        $scope.trip_route = {};
        $scope.isSave = {};
        var mapProp = {
            zoom: 14,
            center: new google.maps.LatLng(google.loader.ClientLocation.latitude, google.loader.ClientLocation.longitude)
        };
        if (!map) {
            console.log("map create " + map + " ");
            map = new google.maps.Map(document.getElementById("route-map"), mapProp);
        }
        $timeout(function () {
            google.maps.event.trigger(map, 'resize');
        }, 100);

        if (!currentTrip.route) {
            $scope.isSave = false;
            google.maps.event.addListener(map, 'click', function (event) {
                placeMarker(event.latLng);
            });
        } else {
            $scope.isSave = true;
            $scope.trip_route = currentTrip.route;
            createStartMarker(new google.maps.LatLng($scope.trip_route.start_lat, $scope.trip_route.start_long));
            createFinishMarker(new google.maps.LatLng($scope.trip_route.finish_lat, $scope.trip_route.finish_long));
            calcRoute();
        }
    };

    function calcRoute() {
        console.log("calc route");
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
                $scope.trip_route.distance = directionsDisplay.getDirections().routes[0].legs[0].distance.value;
            }
        });
    };

    function placeMarker(location) {
        if (!start_marker) {
            createStartMarker(location);
            getAddressByPosition(start_marker.getPosition(), true);
        } else if (!finish_marker) {
            createFinishMarker(location);
            calcRoute();
            getAddressByPosition(finish_marker.getPosition(), false);
            $scope.isSave = true;
        }
    };

    $scope.cancelRoute = function () {
        $modalInstance.dismiss();
    };

    $scope.saveRoute = function () {
        var isFormInvalid = false;
        if (!finish_marker) {
            isFormInvalid = true;
            $scope.submittedFinish = true;
            $scope.finish_error = "The finish is required.";
        } else {
            $scope.submittedFinish = false;
        }
        if (!start_marker) {
            isFormInvalid = true;
            $scope.submittedStart = true;
            $scope.start_error = "The start is required.";
        } else {
            $scope.submittedStart = false;
        }
        if (isFormInvalid) {
            return;
        }
        $modalInstance.close($scope.trip_route);
    };

    $scope.findRoute = function () {
        getPositionByAddress();
    };

    $scope.changeField = function () {
        $scope.isSave = false
    };

    var getAddressByPosition = function (position, isStart) {
        console.log(JSON.stringify(position));
        geocoder.geocode({'latLng': new google.maps.LatLng(position.k, position.A)}, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                setRoute(isStart, position, results[0].formatted_address);
            } else {
                console.log('Geocoder failed due to: ' + status);
            }
        });
    };

    var getPositionByAddress = function () {
        $scope.submittedStart = false;
        $scope.submittedFinish = false;
        geocoder.geocode({'address': $scope.trip_route.start}, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var start_location = new google.maps.LatLng(results[0].geometry.location.k, results[0].geometry.location.A);
                if (!start_marker) {
                    createStartMarker(start_location);
                } else {
                    console.log("set position start");
                    start_marker.setPosition(start_location);
                    calcRoute();
                }
                if (finish_marker) {
                    calcRoute();
                }
                setRoute(true, results[0].geometry.location, results[0].formatted_address);
            } else {
                $timeout(function () {
                    $scope.submittedStart = true;
                    if ($scope.trip_route.start == "" || $scope.trip_route.start == undefined) {
                        $scope.start_error = "The start is required";
                    } else {
                        $scope.start_error = "Invalid start address";
                    }
                    $scope.isSave = false;
                    directionsDisplay.setMap(null);
                }, 100);
            }
        });
        geocoder.geocode({'address': $scope.trip_route.finish}, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var finish_location = new google.maps.LatLng(results[0].geometry.location.k, results[0].geometry.location.A);
                if (!finish_marker) {
                    createFinishMarker(finish_location);
                } else {
                    console.log("set position finish");
                    finish_marker.setPosition(finish_location);
                    calcRoute();
                }
                if (start_marker) {
                    calcRoute();
                }
                setRoute(false, results[0].geometry.location, results[0].formatted_address);
            } else {
                $timeout(function () {
                    $scope.submittedFinish = true;
                    if ($scope.trip_route.finish == "" || $scope.trip_route.finish == undefined) {
                        $scope.finish_error = "The finish is required";
                    } else {
                        $scope.finish_error = "Invalid finish address";
                    }
                    $scope.isSave = false;
                    directionsDisplay.setMap(null);
                }, 100);
            }
        });
        $scope.isSave = true;
    };

    var createStartMarker = function (location) {
        start_marker = new google.maps.Marker({
            position: location,
            map: map,
            draggable: true,
            icon: 'images/start_marker.png'
        });
        google.maps.event.addListener(start_marker, 'dragend', function () {
            calcRoute();
            getAddressByPosition(start_marker.getPosition(), true);
        });
    };

    var createFinishMarker = function (location) {
        console.log("create finish");
        finish_marker = new google.maps.Marker({
            position: location,
            map: map,
            draggable: true,
            icon: 'images/finish_marker.png'
        });
        google.maps.event.addListener(finish_marker, 'dragend', function () {
            calcRoute();
            getAddressByPosition(finish_marker.getPosition(), false);
        });
    };

    var setRoute = function (isStart, position, address) {
        $timeout(function () {
            if (isStart) {
                $scope.trip_route.start = address;
                $scope.trip_route.start_lat = position.k;
                $scope.trip_route.start_long = position.A;
            } else {
                $scope.trip_route.finish = address;
                $scope.trip_route.finish_lat = position.k;
                $scope.trip_route.finish_long = position.A;
            }
        }, 100);
    };
};


controllers.controller('ManageClientsController',
    ['$scope', '$kinvey', function ($scope, $kinvey) {

        $scope.clients = [];
        $scope.archived_clients = [];
        $scope.isEdit = [];
        $scope.isClient =[];
        $scope.isEditPermissions = [];
        $scope.isEditArchivedPermissions = [];
        $scope.isSubmittedFirstName = [];
        $scope.isSubmittedLastName = [];
        $scope.isShowArchived=false;
        var promise = $kinvey.DataStore.find('shipment', null, {relations: {client: "clients"}});
        promise.then(
            function (response) {
                for(var i in response){
                    if(response[i].client.isInTrash){
                        if (!isItemExistInArray(response[i].client, $scope.archived_clients)) {
                            $scope.archived_clients.push(response[i].client);
                            $scope.isEditArchivedPermissions.push(false);
                            $scope.isShowArchived=true;
                        }
                    }else{
                        if (!isItemExistInArray(response[i].client, $scope.clients)) {
                            $scope.clients.push(response[i].client);
                            $scope.isEditPermissions.push(false);
                            $scope.isClient.push(true);
                        }
                    }
                }
                var promise = $kinvey.DataStore.find('clients', null);
                promise.then(
                    function(response){
                        for (var i in response) {
                            if (response[i].isInTrash) {
                                if (!isItemExistInArray(response[i], $scope.archived_clients)) {
                                    $scope.archived_clients.push(response[i]);
                                    $scope.isEditArchivedPermissions.push(true);
                                    $scope.isShowArchived=true;
                                }
                            } else if (!isItemExistInArray(response[i], $scope.clients)) {
                                $scope.clients.push(response[i]);
                                $scope.isEditPermissions.push(true);
                                $scope.isClient.push(true);
                            }
                        }
                    },function(error){
                        console.log("get clients error " + error.description);
                    }
                );
            },
            function (error) {
                console.log("get clients error " + error.description);
            }
        );

        $scope.addNewClient = function () {
            $scope.clients.unshift({});
            $scope.isEdit.unshift(true);
            $scope.isClient.unshift(false);
            $scope.isEditPermissions.unshift(true);
            $scope.isSubmittedFirstName.unshift(false);
            $scope.isSubmittedLastName.unshift(false);
        };

        $scope.editClient = function (index) {
            $scope.isEdit[index] = !$scope.isEdit[index];
        };

        $scope.saveClient = function (index, client) {
            var isFormInvalid = false;
            if (!client.first_name) {
                isFormInvalid = true;
                $scope.isSubmittedFirstName[index] = true;
            } else {
                $scope.isSubmittedFirstName[index] = false;
            }
            if (!client.last_name) {
                isFormInvalid = true;
                $scope.isSubmittedLastName[index] = true;
            } else {
                $scope.isSubmittedLastName[index] = false;
            }
            if (isFormInvalid) {
                return;
            }
            $scope.isEdit[index] = !$scope.isEdit[index];
            $scope.isClient[index] = true;
            var promise = $kinvey.DataStore.save("clients", client);
            promise.then(function (response) {
                console.log("save client whit success");
                $scope.clients[index] = response;
            }, function (error) {
                console.log("save client whit error " + error.description);
            });
        };

        $scope.archiveClient = function (index, client) {
            if ($scope.archived_clients.length === 0) {
                $scope.isShowArchived = true;
            }
            $scope.clients.splice(index, 1);
            $scope.isEdit.splice(index, 1);
            $scope.isClient.splice(index,1);
            $scope.isSubmittedFirstName.splice(index, 1);
            $scope.isSubmittedLastName.splice(index, 1);

            $scope.archived_clients.push(client);
            $scope.isEditArchivedPermissions.push($scope.isEditPermissions[index]);
            $scope.isEditPermissions.splice(index, 1);
            client.isInTrash = true;
            saveClientOnKinvey(JSON.parse(JSON.stringify(client)));
        };

        $scope.deleteClient = function (index, client) {
            $scope.archived_clients.splice(index, 1);
            $scope.isEditArchivedPermissions.splice(index, 1);
            if ($scope.archived_clients.length === 0) {
                $scope.isShowArchived = false;
            }
            if (client._id !== undefined) {
                var promise = $kinvey.DataStore.destroy('clients', client._id);
                promise.then(function (response) {
                    console.log("delete client with success");
                }, function (error) {
                    console.log("delete client with error " + error.description);
                });
            }
        };

        $scope.restoreClient = function (index, client) {
            $scope.archived_clients.splice(index, 1);
            $scope.clients.push(client);
            $scope.isEditPermissions.push($scope.isEditArchivedPermissions[index]);
            $scope.isEditArchivedPermissions.splice(index, 1);
            $scope.isEdit.push(false);
            $scope.isClient.push(true);
            $scope.isSubmittedFirstName.push(false);
            $scope.isSubmittedLastName.push(false);
            if ($scope.archived_clients.length === 0) {
                $scope.isShowArchived = false;
            }
            client.isInTrash = false;
            saveClientOnKinvey(JSON.parse(JSON.stringify(client)));
        };

        $scope.cancelClient = function(index){
            $scope.clients.splice(index,1);
            $scope.isEdit.splice(index, 1);
            $scope.isClient.splice(index,1);
            $scope.isSubmittedFirstName.splice(index, 1);
            $scope.isSubmittedLastName.splice(index, 1);
            $scope.isEditPermissions.splice(index,1);
        };

        $scope.restoreAllClients = function(){
            var length = $scope.archived_clients.length;
            var i = 0;
            while(i<length){
                $scope.restoreClient(0,$scope.archived_clients[0]);
                i++;
            }
        };

        $scope.deleteAllClients = function(){
            var length = $scope.archived_clients.length;
            var i = 0;
            while(i<length){
                $scope.deleteClient(0,$scope.archived_clients[0]);
                i++;
            }
        };

        var saveClientOnKinvey = function(client){
            var promise = $kinvey.DataStore.save("clients", client);
            promise.then(function (response) {
                console.log("save client whit success");
            }, function (error) {
                console.log("save client whit error " + error.description);
            });
        }
    }]);


controllers.controller('ManageShipmentsController',
    ['$scope', '$kinvey', function ($scope, $kinvey) {

        $scope.shipments = [];
        $scope.archived_shipments = [];
        $scope.isEdit = [];
        $scope.isShipment = [];
        $scope.isEditPermissions = [];
        $scope.isEditArchivedPermissions = [];
        $scope.isSubmittedName = [];
        $scope.isSubmittedDetails = [];
        $scope.isShowArchived = false;
        var promise = $kinvey.DataStore.find('shipment', null, {relations: {info: "shipment-info"}});
        promise.then(
            function (response) {
                for(var i in response){
                    if(response[i].info.isInTrash){
                        if (!isItemExistInArray(response[i].info, $scope.archived_shipments)) {
                            $scope.archived_shipments.push(response[i].info);
                            $scope.isEditArchivedPermissions.push(false);
                            $scope.isShowArchived = true;
                        }
                    }else if (!isItemExistInArray(response[i].info, $scope.shipments)) {
                        $scope.shipments.push(response[i].info);
                        $scope.isEditPermissions.push(false);
                        $scope.isShipment.push(true);
                    }
                }
                var promise = $kinvey.DataStore.find('shipment-info', null);
                promise.then(function(response){
                    for (var i in response) {
                        if (response[i].isInTrash) {
                            if (!isItemExistInArray(response[i], $scope.archived_shipments)) {
                                $scope.archived_shipments.push(response[i]);
                                $scope.isEditArchivedPermissions.push(true);
                                $scope.isShowArchived = true;
                            }
                        } else if (!isItemExistInArray(response[i], $scope.shipments)) {
                            $scope.shipments.push(response[i]);
                            $scope.isEditPermissions.push(true);
                            $scope.isShipment.push(true);
                        }
                    }
                },function(error){
                    console.log("get shipment info error " + error.description);
                });
            },
            function (error) {
                console.log("get shipment info error " + error.description);
            }
        );

        $scope.addNewShipment = function () {
            $scope.shipments.unshift({});
            $scope.isEdit.unshift(true);
            $scope.isShipment.unshift(false);
            $scope.isEditPermissions.unshift(true);
            $scope.isSubmittedName.unshift(false);
            $scope.isSubmittedDetails.unshift(false);
        };

        $scope.editShipment = function (index) {
            $scope.isEdit[index] = !$scope.isEdit[index];
        };

        $scope.saveShipment = function (index, shipment) {
            var isFormInvalid = false;
            if (!shipment.name) {
                isFormInvalid = true;
                $scope.isSubmittedName[index] = true;
            } else {
                $scope.isSubmittedName[index] = false;
            }
            if (!shipment.details) {
                isFormInvalid = true;
                $scope.isSubmittedDetails[index] = true;
            } else {
                $scope.isSubmittedDetails[index] = false;
            }
            if (isFormInvalid) {
                return;
            }
            $scope.isEdit[index] = !$scope.isEdit[index];
            $scope.isShipment[index] = true;
            var promise = $kinvey.DataStore.save("shipment-info", shipment);
            promise.then(function (response) {
                console.log("save shipment whit success");
                $scope.shipments[index] = response;
            }, function (error) {
                console.log("save shipment whit error " + error.description);
            });
        };

        $scope.archiveShipment = function (index, shipment) {
            if ($scope.archived_shipments.length === 0) {
                $scope.isShowArchived = true;
            }
            $scope.shipments.splice(index, 1);
            $scope.isEdit.splice(index, 1);
            $scope.isShipment.splice(index,1);
            $scope.isSubmittedName.splice(index, 1);
            $scope.isSubmittedDetails.splice(index, 1);
            $scope.isEditArchivedPermissions.push($scope.isEditPermissions[index]);
            $scope.isEditPermissions.splice(index, 1);
            $scope.archived_shipments.push(shipment);
            shipment.isInTrash = true;
            saveShipmentOnKinvey(JSON.parse(JSON.stringify(shipment)));
        };

        $scope.deleteShipment = function (index, shipment) {
            $scope.archived_shipments.splice(index, 1);
            $scope.isEditArchivedPermissions.splice(index, 1);
            if ($scope.archived_shipments.length === 0) {
                $scope.isShowArchived = false;
            }
            if (shipment._id !== undefined) {
                var promise = $kinvey.DataStore.destroy('shipment-info', shipment._id);
                promise.then(function (response) {
                    console.log("delete shipment with success");
                }, function (error) {
                    console.log("delete shipment with error " + error.description);
                });
            }
        };

        $scope.restoreShipment = function (index, shipment) {
            $scope.archived_shipments.splice(index, 1);
            $scope.shipments.push(shipment);
            $scope.isEdit.push(false);
            $scope.isShipment.push(true);
            $scope.isEditPermissions.push($scope.isEditArchivedPermissions[index]);
            $scope.isEditArchivedPermissions.splice(index, 1);
            $scope.isSubmittedName.push(false);
            $scope.isSubmittedDetails.push(false);
            if ($scope.archived_shipments.length === 0) {
                $scope.isShowArchived = false;
            }
            shipment.isInTrash = false;
            saveShipmentOnKinvey(JSON.parse(JSON.stringify(shipment)));
        };

        $scope.cancelShipment = function(index){
            $scope.shipments.splice(index,1);
            $scope.isEdit.splice(index, 1);
            $scope.isShipment.splice(index,1);
            $scope.isSubmittedDetails.splice(index, 1);
            $scope.isSubmittedName.splice(index, 1);
            $scope.isEditPermissions.splice(index,1);
        };

        $scope.restoreAllShipments = function(){
            var length = $scope.archived_shipments.length;
            var i = 0;
            while(i<length){
                $scope.restoreShipment(0,$scope.archived_shipments[0]);
                i++;
            }
        };

        $scope.deleteAllShipments = function(){
            var length = $scope.archived_shipments.length;
            var i = 0;
            while(i<length){
                $scope.deleteShipment(0,$scope.archived_shipments[0]);
                i++;
            }
        };

        var saveShipmentOnKinvey = function(shipment){
            var promise = $kinvey.DataStore.save("shipment-info", shipment);
            promise.then(function (response) {
                console.log("save shipment whit success");
            }, function (error) {
                console.log("save shipment whit error " + error.description);
            });
        }
    }]);

var isItemExistInArray = function(item, array){
    for (var i in array) {
        if (array[i]._id == item._id) {
            return true;
        }
    }
    return false;
};