app.controller('rsvsOverviewController',
 ['$rootScope', '$scope', '$state', '$http', 'mdDlg', 'rsvs',
 function($rs, $scope, $state, $http, mdDlg, rsvs) {
   $scope.rsvs = rsvs;
   var impagePath = 'Icons/MaterialIcon.png';

   
   
   displayError = function(err) {
   }
   $scope.checkRsv = function ($index, s) {
      return $scope.rsvs[$index].status === s;
   }

   $scope.changeMyRsv = function($index, s) {
      var rid = $scope.rsvs[$index].id;
      var pid = $rs.user.id;
      
      $http.put('/Prss/' + pid + '/Rsvs/' + rid, {status: s})
      .then(function () {
         return $http.get('/Prss/' + pid + '/Rsvs/');
      })
      .then(function (response) {
         $scope.rsvs = response.data;
      })
      .catch(function(err) {
         if (err.data[0].tag) {
            nDlg.show($scope, "Error:" + err.data[0].tag, "Error");
         }
      })
   }

   $scope.delRsv = function($index) {
      //console.log($rs);
      var rid = $scope.rsvs[$index].id;
      var eid = $scope.rsvs[$index].evtId;
      var pid = $rs.user.id;

      mdDlg.login($scope, "Delete this Reservation?", "Delete Reservation", 
       ["Yes", "No"])
      .then(function(btn) {
         if (btn) {
            return $http.delete("Evts/"+eid+"/Rsvs/"+rid)
            .then(function() {
               return $http.get("/Prss/"+pid+"/Rsvs/");
            })
            .then(function(response) {
               $scope.rsvs = response.data;
            });
         }
      });
      

   };


}]);
