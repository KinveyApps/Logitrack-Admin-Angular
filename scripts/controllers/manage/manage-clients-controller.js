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

controllers.controller('ManageClientsController',
    ['$scope', '$kinvey','$modal', '$rootScope', function ($scope, $kinvey, $modal, $rootScope) {

        initClients();

        var all_clients = [];
        $scope.$on('REFRESH_CLIENTS', function () {
            initClients();
        });

        $scope.addNewClient = function () {
            if($scope.isNewClientExists){
                $scope.clients[0] = {};
                $scope.isEdit[0] = true;
                $scope.isClient[0] = false;
                $scope.isEditPermissions[0] = true;
                $scope.isSubmittedFirstName[0] = false;
                $scope.isSubmittedLastName[0] = false;
            }else {
                $scope.clients.unshift({});
                $scope.isEdit.unshift(true);
                $scope.isClient.unshift(false);
                $scope.isEditPermissions.unshift(true);
                $scope.isSubmittedFirstName.unshift(false);
                $scope.isSubmittedLastName.unshift(false);
                $scope.isNewClientExists = true;
            }
        };

        $scope.editClient = function (index) {
            $scope.isEdit[index] = !$scope.isEdit[index];
        };

        $scope.saveClient = function (index, client) {
            //check is form valid
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

            if(index == 0 && $scope.isNewClientExists){
                $scope.isNewClientExists = false;
            }
            //Kinvey update client starts
            var promise = $kinvey.DataStore.save("clients", client);
            promise.then(function (response) {
                console.log("save client whit success");
                setClientById(response);
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
            $scope.isClient.splice(index, 1);
            $scope.isSubmittedFirstName.splice(index, 1);
            $scope.isSubmittedLastName.splice(index, 1);

            $scope.archived_clients.push(client);
            $scope.isEditArchivedPermissions.push($scope.isEditPermissions[index]);
            $scope.isEditPermissions.splice(index, 1);
            client.isInTrash = true;
            saveClientOnKinvey(JSON.parse(JSON.stringify(client)));
        };

        $scope.deleteClient = function (index, client) {
            var modalInstance = $modal.open({
                templateUrl: 'clientDeleteModal.html',
                controller: ConfirmDeleteController,
                size: "sm"
            });
            modalInstance.result.then(function () {
                deleteClientFromKinvey(index, client);
            }, function () {
                console.log("result canceled");
            });
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

        $scope.cancelClient = function (index) {
            $scope.isNewClientExists = false;
            $scope.clients.splice(index, 1);
            $scope.isEdit.splice(index, 1);
            $scope.isClient.splice(index, 1);
            $scope.isSubmittedFirstName.splice(index, 1);
            $scope.isSubmittedLastName.splice(index, 1);
            $scope.isEditPermissions.splice(index, 1);
        };

        $scope.restoreAllClients = function () {
            var length = $scope.archived_clients.length;
            var i = 0;
            while (i < length) {
                $scope.restoreClient(0, $scope.archived_clients[0]);
                i++;
            }
        };

        $scope.deleteAllClients = function () {
            var modalInstance = $modal.open({
                templateUrl: 'clientDeleteModal.html',
                controller: ConfirmDeleteController,
                size: "sm"
            });
            modalInstance.result.then(function () {
                var length = $scope.archived_clients.length;
                var i = 0;
                while (i < length) {
                    deleteClientFromKinvey(0, $scope.archived_clients[0]);
                    i++;
                }
            }, function () {
                console.log("result canceled");
            });
        };

        $scope.cancelExistedClient = function(index,client){
            console.log("get client by ID " + JSON.stringify(getClientById(client._id)));
            $scope.clients[index] = getClientById(client._id);
            $scope.isEdit[index] = !$scope.isEdit[index];
        };

        var saveClientOnKinvey = function (client) {
            //Kinvey update client starts
            var promise = $kinvey.DataStore.save("clients", client);
            promise.then(function (response) {
                setClientById(response);
                console.log("save client whit success");
            }, function (error) {
                console.log("save client whit error " + error.description);
            });
        };

        var deleteClientFromKinvey = function(index, client){
            $scope.archived_clients.splice(index, 1);
            $scope.isEditArchivedPermissions.splice(index, 1);
            if ($scope.archived_clients.length === 0) {
                $scope.isShowArchived = false;
            }
            if (client._id !== undefined) {
                //Kinvey destroy client starts
                var promise = $kinvey.DataStore.destroy('clients', client._id);
                promise.then(function (response) {
                    $rootScope.$broadcast('REFRESH_DISPATCHES');
                    $rootScope.$broadcast('REFRESH_TRIPS');
                    $rootScope.$broadcast('REFRESH_LOGISTICS');
                    console.log("delete client with success");
                }, function (error) {
                    console.log("delete client with error " + error.description);
                });
            }
        };

        function initClients(){
            //scope variables initialization
            $scope.clients = [];
            $scope.archived_clients = [];
            all_clients = [];
            $scope.isEdit = [];
            $scope.isClient = [];
            $scope.isEditPermissions = [];
            $scope.isEditArchivedPermissions = [];
            $scope.isSubmittedFirstName = [];
            $scope.isSubmittedLastName = [];
            $scope.isShowArchived = false;
            $scope.isNewClientExists = false;

            //get all clients and check is client archived or not
            var query = new $kinvey.Query();
            query.equalTo('user_status', 'paused').or().equalTo('user_status', 'in progress');
            var promise = $kinvey.DataStore.find('shipment', query, {relations: {client: "clients"}});
            promise.then(
                function (response) {
                    for (var i in response) {
                        //checks if clients is archived
                        if (response[i].client) {
                            if (response[i].client.isInTrash) {
                                if (!isItemExistInArray(response[i].client, $scope.archived_clients)) {
                                    $scope.archived_clients.push(response[i].client);
                                    $scope.isEditArchivedPermissions.push(false);
                                    $scope.isShowArchived = true;
                                }
                            } else {
                                if (!isItemExistInArray(response[i].client, $scope.clients)) {
                                    $scope.clients.push(response[i].client);
                                    $scope.isEditPermissions.push(false);
                                    $scope.isClient.push(true);
                                }
                            }
                        }
                    }
                    //Kinvey get clients that haven`t assigned trip starts
                    var promise = $kinvey.DataStore.find('clients', null);
                    promise.then(
                        function (response) {
                            all_clients = JSON.parse(JSON.stringify(response));
                            for (var i in response) {
                                if (response[i].isInTrash) {
                                    if (!isItemExistInArray(response[i], $scope.archived_clients)) {
                                        $scope.archived_clients.push(response[i]);
                                        $scope.isEditArchivedPermissions.push(true);
                                        $scope.isShowArchived = true;
                                    }
                                } else if (!isItemExistInArray(response[i], $scope.clients)) {
                                    $scope.clients.push(response[i]);
                                    $scope.isEditPermissions.push(true);
                                    $scope.isClient.push(true);
                                }
                            }
                        }, function (error) {
                            console.log("get clients error " + error.description);
                        }
                    );
                },
                function (error) {
                    console.log("get clients error " + error.description);
                }
            );
        }

        function getClientById(id) {
            for (var i = 0; i < all_clients.length; i++) {
                if (all_clients[i]._id == id) {
                    return JSON.parse(JSON.stringify(all_clients[i]));
                }
            }
        }

        function removeClientById(id) {
            for (var i = 0; i < all_clients.length; i++) {
                if (all_clients[i]._id == id) {
                    all_clients.splice(i, 1);
                }
            }
        }

        function setClientById(client){
            console.log("client " + JSON.stringify(client));
            for (var i = 0; i < all_clients.length; i++) {
                if (all_clients[i]._id == client._id) {
                    all_clients[i] = JSON.parse(JSON.stringify(client));
                    return;
                }
            }
            all_clients.push(JSON.parse(JSON.stringify(client)));
        }
    }]);


var ConfirmDeleteController = function ($scope, $modalInstance) {
    //closes popup
    $scope.ok = function () {
        $modalInstance.close();
    };
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};