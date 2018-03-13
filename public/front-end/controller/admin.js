myApp.controller('adminController', ['$scope', '$state', '$stateParams', '$http', '$timeout', '$location', '$anchorScroll', '$window', function ($scope, $state, $stateParams, $http, $timeout, $location, $anchorScroll, $window) {
    // var currentId = $stateParams.id;
    // $scope.getUser = function () {
    //     // $scope.start();
    //     $http.get('/user').then(function (response) {
    //         // console.log(response.data);
    //         if (response.data === 0) window.location = '/';
    //         else {
    //             $scope.showUserName = response.data;
    //             // $scope.page = 'user';
    //         }
    //     })
    // }

    // $scope.getUser();

    $scope.getAllCases = function () {
        $http.get('/allcomplaints').then(function (response) {
            $scope.complaints = response.data;
        });
    }
    $scope.getAllCases();

    $scope.getMediators = function () {
        $http.get('/allmediators').then(function (response) {
            $scope.mediators = response.data;
        });
    }
    $scope.getMediators();

    // $scope.getMediatorName = function (res) {
    //     $http.get('/getMediatorName/' + res).then(function (response) {
    //         $scope.mediatorName = response.data;
    //     });
    // }

    $scope.btnView = function (res) {
        $http.get('/getmediatordata/' + res).then(function (response) {
            $scope.mediatordata = response.data;
        });
    }

    $scope.btnViewComplaint = function (res) {
        $http.get('/getcomplaintdata/' + res).then(function (response) {
            $scope.complaintdata = response.data;
            // $scope.mediatorName = response.data.MedaiatorName;
        });
    }

    $scope.btnAssignPayment = function (res) {
        var a = {
            'cost': $scope.cost
        }
        $http.post('/addcasepayment/' + res, a).then(function (response) {
            if (response.data == 1) {
                toastr.success('Payment Assigned');
                $state.transitionTo($state.current, $stateParams, {
                    reload: true,
                    inherit: false,
                    notify: true
                });
                $('#myModal').modal('hide');
                $('body').removeClass('modal-open');
                $('.modal-backdrop').remove();
                document.getElementById(response.key).scrollIntoView();
            }
            else {
                toastr["error"]("Error," + " " + "Something went wrong!!!");
            }
        });
    }


    // $scope.complete();
}]);