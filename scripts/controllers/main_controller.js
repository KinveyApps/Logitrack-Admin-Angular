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

        $scope.dispatchClick = function () {
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
