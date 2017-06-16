app.controller('registerController',
 ['$scope', '$state', '$http', 'mdDlg', 'login',
 function($scope, $state, $http, mdDlg, login) {
    $scope.states = ('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ' + 
     'ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD ' + 
     'TN TX UT VT VA WA WV WI WY').split(' ').map(function(state) {
      return {abbrev: state};
    });   
    
   $scope.user= {}; 
   $scope.errors = [];

   $scope.registerUser = function() {
      $http.post("Prss", $scope.user)
      .then(function() {
         return mdDlg.login($scope, "Registration succeeded. " + 
         "Login automatically?", "Login", ["Yes", "No"]);
      })
      .then(function(btn) {
         console.log(btn);
         if (btn) {
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
         if (err && err.data) {
            $scope.errors = err.data;
         }
         else {
            $state.go('login');
         }
      });
   };

   $scope.quit = function() {
      $state.go('home');
   };
}]);
