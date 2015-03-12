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
    ['$scope', '$kinvey', "$modal", function ($scope, $kinvey, $modal) {
        //dispatch tab initialization
        $scope.initPage = function () {
           initDispatches();
        };

        $scope.$on('UPDATE_CLIENTS', function () {
            getClients();
        });

        $scope.$on('REFRESH_DISPATCHES', function () {
            initDispatches();
        });

        $scope.selectDriver = function (driver, index) {
            $scope.isDriversOpen[index] = !$scope.isDriversOpen[index];
            $scope.new_shipments[index].driver = driver;
        };

        //creates new dispatch
        $scope.createNewDispatch = function () {
            getClients();
            getShipmentInfos();
            $scope.isNewRequestCollapsed = false;
            $scope.new_shipments[0] = {user_status: "new"};
            $scope.isEdit[0]=true;
            $scope.isClientsOpen[0] = false;
            $scope.isDriversOpen[0] = false;
            $scope.isTripsOpen[0] = false;
            $scope.isShipmentNameOpen[0] = false;
            $scope.isShipmentNameSelected[0] = false;
            $scope.trips[0] = {};
            $scope.tripDropdownDisabled[0] = true;
            $scope.selected_client = "Select client";
            $scope.selected_trip = "Select trip";
        };


        $scope.selectClient = function (client, shipment, index) {
            $scope.isClientsOpen[index] = !$scope.isClientsOpen[index];
            $scope.selected_client = client.first_name + " " + client.last_name;
            $scope.tripDropdownDisabled[index] = true;
            shipment.client = client;
            var query = new $kinvey.Query();
            query.equalTo('client._id', client._id);
            query.equalTo('user_status', "new");

            //Kinvey get routes of client with user_status "new" starts
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

            //checks is form valid
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
            $scope.new_shipments.splice(index, 1);
            $scope.isClientsOpen.splice(index, 1);
            $scope.isDriversOpen.splice(index, 1);
            $scope.isTripsOpen.splice(index, 1);
            $scope.tripDropdownDisabled.splice(index, 1);
            $scope.isShipmentNameOpen.splice(index, 1);
            $scope.isShipmentNameSelected.splice(index, 1);
            $scope.trips.splice(index, 1);
            $scope.isEdit.splice(index, 1);
        };

        $scope.startDispatch = function (index, shipment) {
            $scope.isEdit[index] = false;
            delete shipment.date;
            delete shipment.request_time;
            shipment.user_status = "open";

            //Kinvey update dispatch starts
            var promise = $kinvey.DataStore.save("shipment", shipment, {relations: { route: 'route',
                client: "clients",
                driver: "user",
                info: "shipment-info"}});
            promise.then(
                function (responce) {
                    console.log("update shipment success");
                    $scope.new_shipments.splice(index, 1);
                    $scope.open_shipments.unshift(responce);
                    setFormatDateTime(responce);
                    $scope.isNewRequestCollapsed = true;
                },
                function (error) {
                    console.log("update shipment error " + error.description);
                }
            );
        };

        $scope.deleteDispatch = function(index, shipment){
            console.log("delete click " + index);
            console.log("delete trip ");
            var modalInstance = $modal.open({
                templateUrl: 'dispatchDeleteModal.html',
                controller: ConfirmDeleteController,
                size: "sm"
            });
            modalInstance.result.then(function () {
                deleteDispatchFromKinvey(index, shipment);
            }, function () {
                console.log("result canceled");
            });
        };

        //shows popup map with route
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

        //gets clients for which the routes haven`t consigned drivers
        var getClients = function () {
            $scope.clients = [];
            var query = new $kinvey.Query();
            query.equalTo('user_status', 'new');
            var promise = $kinvey.DataStore.find('shipment', query, {relations: {client: "clients", route: "route"}});
            promise.then(
                function (response) {
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

        //gets shipment infos
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

        //converts date in right format
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

        var deleteDispatchFromKinvey = function(index, shipment){
            console.log("shipment " + JSON.stringify(shipment));
            //Kinvey delete trip starts
            var promise = $kinvey.DataStore.destroy('shipment', shipment._id);
            promise.then(function (response) {
                console.log("delete trip with success");
                $scope.$broadcast('REFRESH_LOGISTICS');
                $scope.open_shipments.splice(index, 1);
            }, function (error) {
                console.log("delete trip with error " + error.description);
            });
        };

        function initDispatches(){
            //scope variables initialization
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
            $scope.trips = [];
            $scope.new_shipments = [];
            $scope.open_shipments = [];
            $scope.progress_shipments = [];
            $scope.paused_shipments = [];
            $scope.isNewRequestCollapsed = true;

            //Kinvey get shipments starts
            var promise = $kinvey.DataStore.find('shipment', null, {relations: { route: "route",
                client: "clients",
                driver: "user",
                info: "shipment-info"}});
            promise.then(
                function (response) {
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
                            case "paused":
                                $scope.paused_shipments.push(response[i]);
                                setFormatDateTime(response[i]);
                                $scope
                        }
                    }
                },
                function (error) {
                    console.log("get shipment error " + JSON.stringify(error.description));
                }
            );
            getClients();
            getShipmentInfos();

            var query = new $kinvey.Query();
            query.equalTo('status', 'driver');

            //Kinvey get users with status 'driver' starts
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
    }]);

var MapController = function ($scope, $kinvey, $modalInstance, currentTrip) {
    var start_marker;
    var finish_marker;
    var user_marker;
    var map;
    var directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setOptions({
        suppressMarkers: true
    });
    var directionsService = new google.maps.DirectionsService();

    //map popup initialization
    $scope.initialize = function () {
        var mapCenter =new google.maps.LatLng((currentTrip.route.start_lat + currentTrip.route.finish_lat) / 2, (currentTrip.route.start_long + currentTrip.route.finish_long) / 2);

        //map creation
        var mapProp = {
            zoom: 14,
            center: mapCenter
        };

        if (!map) {
            map = new google.maps.Map(document.getElementById("view_route_map"), mapProp);
        }

        //markers creation
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
        var isTripActive = currentTrip.user_status == "paused" || currentTrip.user_status == "in progress";

        if(isTripActive && currentTrip.status && currentTrip.status != "Not tracked" && currentTrip.driver.position){

            user_marker = new google.maps.Marker({
                position: new google.maps.LatLng(currentTrip.driver.position.lat, currentTrip.driver.position.lon),
                map: map,
                icon: 'images/user_marker.png'
            });
        }

        window.setTimeout(function () {
            google.maps.event.trigger(map, 'resize');
            map.setCenter(mapCenter);
        }, 1);
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
            }
        });
    }

    //closes popup
    $scope.acceptTrip = function () {
        $modalInstance.dismiss();
    };
};