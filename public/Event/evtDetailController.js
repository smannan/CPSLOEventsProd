app.controller("evtDetailController", 
 ['$rootScope', '$scope', '$stateParams', '$state', '$http', 'notifyDlg',
 function($rs, $scope, $stateParams, $state, $http, nDlg) {
   var evtId = $stateParams.evtId;
   var pid = $rs.user.id;
   $scope.myrsv = null;

   // Get event information
   $http.get('/Evts/' + evtId)
   .then(function(response) {
      $scope.events = response.data;
      console.log($scope.events);
      return $http.get('/Evts/' + evtId + '/Rsvs');
   })
   .then(function(response) {
      $scope.rsvs = response.data;
      console.log($scope.rsvs);
      return getMyRsv();
   })
   .catch(function(err) {
      $scope.events = null;
      $scope.rsvs = null;
      $scope.myrsv = null;
   });

   var getMyRsv = function () {
      return $http.get('/Prss/' + pid + '/Rsvs')
      .then(function(response) {
         response.data.forEach(function(rsvtemp) {
            if (rsvtemp.evtId === parseInt(evtId))
               $scope.myrsv = rsvtemp;
         });
         console.log("myrsv is " + $scope.myrsv ? " valid " : " null " );
         if ($scope.myrsv)
            console.log($scope.myrsv);
      });
   };

   $scope.checkRsv = function(s) {
      return $scope.myrsv ? $scope.myrsv.status === s : false;
   };

   $scope.changeMyRsv = function(s) {
      (function() {
         if (!$scope.myrsv) {
            return $http.post('/Evts/' + evtId + '/Rsvs', 
             {prsId: pid, evtId: evtId, status:s});
         } else {
            var rid = $scope.myrsv.id;
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
