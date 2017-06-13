app.controller('navController', 
 ['$scope', '$state', 
 function($scope, $state) {
    var initTab = "login";
    $scope.selectedItem = initTab;
    $state.go(initTab);
}]);
