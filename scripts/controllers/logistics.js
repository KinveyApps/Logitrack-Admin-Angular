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

controllers.controller('LogisticsController',
    ['$scope', '$kinvey', "$modal", function ($scope, $kinvey, $modal) {
        var query = new $kinvey.Query();
        query.equalTo('user_status', 'in progress');
        var promise = $kinvey.DataStore.find('shipment', query, {relations: { route: "route",
            client: "clients",
            driver: "user",
            info: "shipment-info"}});
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


