app.controller('loginController', 
 ['$rootScope', '$scope', '$state', 'login', 'mdDlg', 
 function($rootScope, $scope, $state, login, mdDlg) {
    $scope.login = function() {
      login.login($scope.user)
      .then(function(user) {
         $rootScope.user = user;
         $state.go('home');
      })
      .catch(function() {
         mdDlg.login($scope, "That name/password is not in our records.", 
          "Error", ["Ok"]);
      });
   };
}]);
