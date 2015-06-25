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
        };
        $scope.registerUser = function () {
            $location.path('/templates/sign_up');
        };

        $scope.micLogin = function(){
            var promise = $kinvey.User.MIC.loginWithAuthorizationCodeLoginPage('http://localhost:63342/Logitrack-Admin-Angular/index.html');
            promise.then(function(user) {
                //if (user._socialIdentity && user._socialIdentity.kinveyAuth && user._socialIdentity.kinveyAuth.id.indexOf("admin") != -1) {
                    $scope.submittedError = false;
                    $location.path('/templates/main');
                //}
                //else {
                //    $scope.submittedError = true;
                //    $scope.errorDescription = "You don't have required permissions";
                //    var promise = $kinvey.User.MIC.logout();
                //    promise.then(
                //        function () {
                //            console.log("Sign out with success");
                //        },
                //        function (error) {
                //            console.log("Sign out error " + error.description);
                //        }
                //    );
                //}
            }, function(err) {
                alert("error " + JSON.stringify(err));
            });
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