app.controller('loginController', 
 ['$rootScope', '$scope', '$state', 'login', 'notifyDlg', 
 function($rootScope, $scope, $state, login, nDlg) {
   // Autologin as admin for testing
   // $scope.user = {email: "adm@11.com", password: "password"};
   
   $scope.login = function() {
      console.log("Trying to login user " + $scope.user.email);
      
      login.login($scope.user)
      .then(function(user) {
         $scope.$parent.user = user;
         $state.go('home');
      })
      .catch(function() {
         nDlg.show($scope, "That name/password is not in our records.", 
          "Error");
      });
   };
   
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
