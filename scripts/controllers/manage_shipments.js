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
                for (var i in response) {
                    if (response[i].info) {
                        if (response[i].info.isInTrash) {
                            if (!isItemExistInArray(response[i].info, $scope.archived_shipments)) {
                                $scope.archived_shipments.push(response[i].info);
                                $scope.isEditArchivedPermissions.push(false);
                                $scope.isShowArchived = true;
                            }
                        } else if (!isItemExistInArray(response[i].info, $scope.shipments)) {
                            $scope.shipments.push(response[i].info);
                            $scope.isEditPermissions.push(false);
                            $scope.isShipment.push(true);
                        }
                    }
                }
                var promise = $kinvey.DataStore.find('shipment-info', null);
                promise.then(function (response) {
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
                }, function (error) {
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
            $scope.isShipment.splice(index, 1);
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

        $scope.cancelShipment = function (index) {
            $scope.shipments.splice(index, 1);
            $scope.isEdit.splice(index, 1);
            $scope.isShipment.splice(index, 1);
            $scope.isSubmittedDetails.splice(index, 1);
            $scope.isSubmittedName.splice(index, 1);
            $scope.isEditPermissions.splice(index, 1);
        };

        $scope.restoreAllShipments = function () {
            var length = $scope.archived_shipments.length;
            var i = 0;
            while (i < length) {
                $scope.restoreShipment(0, $scope.archived_shipments[0]);
                i++;
            }
        };

        $scope.deleteAllShipments = function () {
            var length = $scope.archived_shipments.length;
            var i = 0;
            while (i < length) {
                $scope.deleteShipment(0, $scope.archived_shipments[0]);
                i++;
            }
        };

        var saveShipmentOnKinvey = function (shipment) {
            var promise = $kinvey.DataStore.save("shipment-info", shipment);
            promise.then(function (response) {
                console.log("save shipment whit success");
            }, function (error) {
                console.log("save shipment whit error " + error.description);
            });
        }
    }]);


var isItemExistInArray = function (item, array) {
    for (var i in array) {
        if (array[i]._id == item._id) {
            return true;
        }
    }
    return false;
};