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

        $scope.$on('UPDATE_CLIENTS', function () {
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
                            if ($scope.trips[index] === undefined) {
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

        $scope.selectShipmentName = function (shipment, info, index) {
            $scope.isShipmentNameOpen[index] = !$scope.isShipmentNameOpen[index];
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
            if (!shipment.info) {
                $scope.isSubmittedShipmentName[index] = true;
                isFormInvalid = true;
            } else {
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
                info: "shipment-info"}});
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
            var promise = $kinvey.DataStore.find('shipment', query, {relations: {client: "clients", route: "route"}});
            promise.then(
                function (response) {
                    console.log("get client success " + response.length);
                    console.log("clients " + JSON.stringify(response));
                    for (var i in response) {
                        if (!response[i].route.isInTrash && !response[i].client.isInTrash) {
                            if (!isItemExistInArray(response[i].client, $scope.clients)) {
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

        var getShipmentInfos = function () {
            $scope.shipment_infos = [];
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

var MapController = function ($scope, $kinvey, $location, $modalInstance, currentTrip) {
    var start_marker;
    var finish_marker;
    var map;
    var directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setOptions({
        suppressMarkers: true
    });
    var directionsService = new google.maps.DirectionsService();
    $scope.initialize = function () {
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