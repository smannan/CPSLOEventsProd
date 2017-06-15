app.controller("evtDetailController", 
 ['$rootScope', '$scope', '$stateParams', '$state', '$http', 'notifyDlg',
 function($rs, $scope, $stateParams, $state, $http, nDlg) {
   var evtId = $stateParams.evtId;
   var pid = $rs.user.id;
   var myrsv = null;

   // Get event information
   $http.get('/Evts/' + evtId)
   .then(function(response) {
      $scope.events = response.data;
      console.log($scope.events);
   })
   .catch(function(err) {
      $scope.events = null;
   });
    
   // Get all reservations for this event 
   $http.get('/Evts/' + evtId + '/Rsvs')
   .then(function(response) {
      $scope.rsvs = response.data;
      console.log($scope.rsvs);
   })
   .catch(function(err) {
      $scope.rsvs = null;
   });

   var getMyRsv = function () {
      return $http.get('/Prss/' + pid + '/Rsvs')
      .then(function(response) {
         response.data.forEach(function(rsvtemp) {
            if (rsvtemp.evtId === parseInt(evtId))
               myrsv = rsvtemp;
         });
      });
   };
   getMyRsv();

   $scope.checkRsv = function(s) {
      return myrsv ? myrsv.status === s : false;
   };

   $scope.changeMyRsv = function(s) {
      (function() {
         if (!myrsv) {
            return $http.post('/Evts/' + evtId + '/Rsvs', 
             {prsId: pid, evtId: evtId});
         } else {
            var rid = myrsv.id;
            return $http.put('/Prss/' + pid + '/Rsvs/' + rid, {status: s});
         }
      })()
      .then(function() {
         return $http.get('Evts/' + evtId + '/Rsvs');
      })
      .then(function(response) {
         $scope.rsvs = response.data;
         return getMyRsv();
      })
      .catch(function(err) {
         if (err.data[0].tag) {
            nDlg.show($scope, "Error: " + err.data[0].tag, "Error");
         }
      })
   };
}]);
