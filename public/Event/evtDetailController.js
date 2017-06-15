app.controller("evtDetailController", 
 ['$scope', '$stateParams', '$state', '$http', 'notifyDlg',
 function($scope, $stateParams, $state, $http, nDlg) {
   var evtId = $stateParams.evtId;
  
   // Get event information
   $http.get('/Evts/' + evtId)
   .then(function(response) {
      $scope.events = response.data;
   })
   .catch(function(err) {
      $scope.events = null;
   });
    
   // Get all reservations for this event 
   $http.get('/Evts/' + evtId + '/Rsvs')
   .then(function(response) {
      $scope.reservations = response.data;
   })
   .catch(function(err) {
      $scope.rsvs = null;
   });
   
   $scope.createEvent = function() {
      if (!$scope.newEvent) {
         nDlg.show($scope, "Error: No Reservation for Event " +
          evtId, "Error");
      }
      else {
         $http.post('/Evts/' + evtId + '/Msgs', {content: $scope.newEvent})
         .then(function() {
            $scope.newEvent = null;
            //return $http.get('/Cnvs/' + evtId + '/Msgs')
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
