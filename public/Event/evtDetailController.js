app.controller("cnvDetailController", 
 ['$scope', '$stateParams', '$state', '$http', 'notifyDlg',
 function($scope, $stateParams, $state, $http, nDlg) {
   var cnvId = $stateParams.cnvId;
  
   $http.get('/Cnvs/' + cnvId + '/Msgs')
   .then(function(response) {
      $scope.messages = response.data;
   })
   .catch(function(err) {
      $scope.messages = null;
   });
   
   $scope.createMessage = function() {
      if (!$scope.newMessage) {
         nDlg.show($scope, "Error: No Message for Conversation " +
          cnvId, "Error");
      }
      else {
         $http.post('/Cnvs/' + cnvId + '/Msgs', {content: $scope.newMessage})
         .then(function() {
            $scope.newMessage = null;
            return $http.get('/Cnvs/' + cnvId + '/Msgs')
         })
         .then(function(response) {
            $scope.messages = response.data;
         })
         .catch(function(err) {
            if (err.data[0].tag) {
               nDlg.show($scope, "Error: " + err.data[0].tag, "Error");
            }
         })
      }
   };
}]);
