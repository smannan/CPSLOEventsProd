app.controller('loginController', 
 ['$rootScope', '$scope', '$state', 'login', 'notifyDlg', 
 function($rootScope, $scope, $state, login, nDlg) {
    $scope.user = {email: "UserA@domainA", password: "passwordA"};
    
    $scope.login = function() {
      console.log("Trying to login user " + $scope.user.email);
      
      login.login($scope.user)
      .then(function(user) {
         $rootScope.user = user;
         $state.go('home');
      })
      .catch(function() {
         nDlg.show($scope, "That name/password is not in our records.", 
          "Error");
      });
   };
}]);
