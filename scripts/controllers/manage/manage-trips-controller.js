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

controllers.controller('ManageTripsController',
    ['$scope', '$kinvey', "$modal", function ($scope, $kinvey, $modal) {

        $scope.initPage = function() {
            initTrips();
        };

        $scope.deleteTrip = function (index, trip) {
            console.log("delete trip " + JSON.stringify(trip));
            var modalInstance = $modal.open({
                templateUrl: 'tripDeleteModal.html',
                controller: ConfirmDeleteController,
                size: "sm"
            });
            modalInstance.result.then(function () {
                deleteTripFromKinvey(index, trip);
            }, function () {
                console.log("result canceled");
            });
        };

        $scope.archiveTrip = function (index, trip) {
            if ($scope.archived_trips.length === 0) {
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
            $scope.isEditPermissions.splice(index, 1);

            $scope.archived_trips.unshift(trip);
            saveTripOnKinvey(JSON.parse(JSON.stringify(trip)), 0, true);
        };

        $scope.restoreTrip = function (index, trip) {
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
            if ($scope.archived_trips.length === 0) {
                $scope.isShowArchived = false;
            }
            getClients();
            saveTripOnKinvey(JSON.parse(JSON.stringify(trip)), 0, false);
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
            var modalInstance = $modal.open({
                templateUrl: 'tripDeleteModal.html',
                controller: ConfirmDeleteController,
                size: "sm"
            });
            modalInstance.result.then(function () {
                var length = $scope.archived_trips.length;
                var i = 0;
                while (i < length) {
                    deleteTripFromKinvey(0, $scope.archived_trips[0]);
                    i++;
                }
            }, function () {
                console.log("result canceled");
            });
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
            //checks is form valid
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
            saveTripOnKinvey(savedTrip, index, false);
        };

        $scope.cancelTrip = function (index) {
            $scope.trips.splice(index, 1);
            $scope.isClientsOpen.splice(index, 1);
            $scope.isEdit.splice(index, 1);
            $scope.isSubmittedClient.splice(index, 1);
            $scope.isSubmittedRoute.splice(index, 1);
            $scope.isRoute.splice(index, 1);
            $scope.routeBtnText.splice(index, 1);
            $scope.isEditPermissions.splice(index, 1);
        };

        $scope.selectClient = function (client, trip, index) {
            $scope.isClientsOpen[index] = !$scope.isClientsOpen[index];
            trip.client = client;
        };

        //shows map with route
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

            //Kinvey duplicate trip starts
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
                    $scope.isEditPermissions.splice(index, 0, true);
                    getClients();
                },
                function (error) {
                    console.log("update trip error " + error.description);
                }
            );
        };

        $scope.$on('UPDATE_CLIENTS', function () {
            getClients();
        });

        $scope.$on('REFRESH_TRIPS', function () {
            initTrips();
        });

        //shows map where you can create new route and select route area
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

        var getClients = function () {
            $scope.clients = [];

            //Kinvey get clients starts
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

        var isTripExistInArray = function (trip, array) {
            for (var i in array) {
                if (array[i].route._id == trip.route._id) {
                    return true;
                }
            }
            return false;
        };


        var saveTripOnKinvey = function (trip, index, isArchivedTrip) {
            //Kinvey save shipment starts
            var promise = $kinvey.DataStore.save("shipment", trip, {relations: { route: 'route',
                client: "clients" }});
            promise.then(
                function (responce) {
                    console.log("update shipment success " + JSON.stringify(responce));
                    if(isArchivedTrip){
                        $scope.archived_trips[index] = responce;
                    }else{
                        $scope.trips[index] = responce;
                    }
                },
                function (error) {
                    console.log("update shipment error " + error.description);
                }
            );
        };

        var deleteTripFromKinvey = function (index, trip) {
            console.log("tript paramenter " + JSON.stringify(trip) + "     " + trip._id);
            $scope.archived_trips.splice(index, 1);
            //Kinvey delete trip starts
            var query = new $kinvey.Query();
            query.equalTo('client._id', trip.client._id);
            query.equalTo('route._id', trip.route._id);
            var promise = $kinvey.DataStore.clean('shipment', query);
            promise.then(function (response) {
                console.log("delete trip with success");
            }, function (error) {
                console.log("delete trip with error " + error.description);
            });
            if ($scope.archived_trips.length === 0) {
                $scope.isShowArchived = false;
            }
        };

        function initTrips(){
            //scope variables initialization
            $scope.isEdit = [];
            $scope.trips = [];
            $scope.archived_trips = [];
            $scope.isClientsOpen = [];
            $scope.isSubmittedClient = [];
            $scope.isSubmittedRoute = [];
            $scope.isRoute = [];
            $scope.routeBtnText = [];
            $scope.isEditPermissions = [];
            $scope.isShowArchived = false;
            getClients();

            //Kinvey get shipments starts
            var promise = $kinvey.DataStore.find('shipment', null, {relations: {route: "route", client: "clients"}});
            promise.then(function (response) {
                for (var i in response) {
                    //checks is trip archived or not
                    if (!response[i].route.isInTrash) {
                        if (!isTripExistInArray(response[i], $scope.trips)) {
                            $scope.trips.push(response[i]);
                            $scope.isRoute.push(true);
                            $scope.routeBtnText.push("Edit route");
                            if (response[i].user_status == "new") {
                                $scope.isEditPermissions.push(true);
                            } else {
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
        }
    }]);

var RouteCreateController = function ($scope, $kinvey, $timeout, $modalInstance, currentTrip) {
    var start_marker;
    var finish_marker;
    var map;
    var geocoder = new google.maps.Geocoder();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setOptions({
        suppressMarkers: true
    });
    var directionsService = new google.maps.DirectionsService();
    console.log("current trip " + JSON.stringify(currentTrip));

    $scope.initialize = function () {

        //scope variables initialization
        $scope.trip_route = {};
        $scope.isSave = {};

        //map creation
        var mapProp = {
            zoom: 14,
            center: new google.maps.LatLng(google.loader.ClientLocation.latitude, google.loader.ClientLocation.longitude)
        };
        if (!map) {
            map = new google.maps.Map(document.getElementById("route-map"), mapProp);
        }
        $timeout(function () {
            google.maps.event.trigger(map, 'resize');
        }, 100);

        //checks if we create new route or edit existing one
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

    //builds route between markers
    function calcRoute() {
        var request = {
            origin: new google.maps.LatLng(start_marker.getPosition().lat(), start_marker.getPosition().lng()),
            destination: new google.maps.LatLng(finish_marker.getPosition().lat(), finish_marker.getPosition().lng()),
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

    //map click event listener
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

    //closes popup
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
        $scope.trip_route.isInTrash = false;
        $modalInstance.close($scope.trip_route);
    };

    $scope.findRoute = function () {
        getPositionByAddress();
    };

    $scope.changeField = function () {
        $scope.isSave = false
    };

    var getAddressByPosition = function (position, isStart) {

        var lat = parseFloat(position.k);
        var lng = parseFloat(position.D);
        var latlng = new google.maps.LatLng(lat, lng);
        console.log("get address by position " + JSON.stringify(position));
        geocoder.geocode({'latLng': latlng}, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                console.log("results " + JSON.stringify(results));
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
                var start_location = new google.maps.LatLng(results[0].geometry.location.k, results[0].geometry.location.D);
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
                var finish_location = new google.maps.LatLng(results[0].geometry.location.k, results[0].geometry.location.D);
                if (!finish_marker) {
                    createFinishMarker(finish_location);
                } else {
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
                $scope.trip_route.start_long = position.D;
            } else {
                $scope.trip_route.finish = address;
                $scope.trip_route.finish_lat = position.k;
                $scope.trip_route.finish_long = position.D;
            }
        }, 100);
    };
};