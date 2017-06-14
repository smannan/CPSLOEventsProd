app.controller('registerController',
 ['$scope', '$state', '$http', 'notifyDlg', 'login',
 function($scope, $state, $http, nDlg, login) {
    $scope.states = ('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ' + 
     'ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD ' + 
     'TN TX UT VT VA WA WV WI WY').split(' ').map(function(state) {
      return {abbrev: state};
    });   

   $scope.user = {};
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
      .catch(function(err) {
         $scope.errors = err.data;
      });
   };

   $scope.quit = function() {
      $state.go('home');
   };
}]);
