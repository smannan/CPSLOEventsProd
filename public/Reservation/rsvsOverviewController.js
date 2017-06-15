app.controller('rsvsOverviewController',
 ['$rootScope', '$scope', '$state', '$http', 'notifyDlg', 'rsvs',
 function($rs, $scope, $state, $http, nDlg, rsvs) {
   $scope.rsvs = rsvs;
   var impagePath = 'Icons/MaterialIcon.png';

   
   
   displayError = function(err) {
   }
   
   $scope.delRsv = function($index) {
      console.log($rs);
      var rid = $scope.rsvs[$index].id;
      var eid = $scope.rsvs[$index].evtId;
      var pid = $rs.user.id;

      nDlg.show($scope, "Delete this Reservation?", "Delete Reservation", 
       ["Yes", "No"])
      .then(function(btn) {
         if (btn !== "Yes") {
            return;
         }
         return $http.delete("Evts/"+eid+"/Rsvs/"+rid)
         .then(function() {
            return $http.get("/Prss/"+pid+"/Rsvs/");
         })
         .then(function(response) {
            $scope.rsvs = response.data;
         });
         
      });
      

   };


}]);
