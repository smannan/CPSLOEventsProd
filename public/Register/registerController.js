app.controller('registerController',
 ['$scope', '$state', '$http', 'notifyDlg', 'login',
 function($scope, $state, $http, nDlg, login) {
   $scope.user = {role: 0};
   $scope.errors = [];

   $scope.registerUser = function() {
      $http.post("Prss", $scope.user)
      .then(function() {
         return nDlg.show($scope, "Registration succeeded. " + 
         "Login automatically?", "Login", ["Yes", "No"]);
      })
      .then(function(btn) {
         if (btn === "Yes") {
            login.login($scope.user)
            .then(function(user) {
               $scope.$parent.user = user;
               $state.go('home');
            })
         }
         else { 
            $state.go('login');
         }
      })
      .then(function(response) {
          var location = response.headers().location.split('/');
          return $http.get("Ssns/" + location[location.length - 1]);
      })
      .catch(function(err) {
         $scope.errors = err.data;
      });
   };

   $scope.quit = function() {
      $state.go('home');
   };
}]);
