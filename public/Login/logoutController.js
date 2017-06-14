app.controller('logoutController', 
 ['$rootScope', '$scope', '$state', 'login', 'notifyDlg', 
 function($rootScope, $scope, $state, login, nDlg) {
    $scope.logout = function() {
      console.log("Trying to logout user...");
      
      login.logout()
      .then(function() {
         $rootScope.user = null;
         $rootScope.cookie = null;
         $state.go('home');
      });
   };
}]);
