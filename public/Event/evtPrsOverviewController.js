app.controller('evtPrsOverviewController',
 ['$scope', '$state', '$stateParams', '$http', '$uibModal', 'notifyDlg', 
 function($scope, $state, $stateParams, $http, $uibM, nDlg/*, evts*/) {
   $scope.evts = evts;
   
   displayError = function(err) {
      if (err.data[0].tag === "dupTitle") {
         nDlg.show($scope, "Event with this title already " + 
            "exists!", "Error");
      }
   };

   $scope.newEvt = function() {
      $scope.dlgTitle = "New Event";
      $uibM.open({
         templateUrl: 'Event/editCnvDlg.template.html',
         scope: $scope
      }).result
      .then(function(newTitle) {
         return $http.post("/Evts", {title: newTitle});
      })
      .then(function() {
         return $http.get("/Evts?owner=" + $stateParams.owner);
      })
      .then(function(response) {
         $scope.evts = response.data;
      })
      .catch(function(err) {
         displayError(err);
      });
   };

   $scope.editEvt = function($index) {
      var evtId = $scope.evts[$index].id;

      $scope.dlgTitle = "Edit Event Title";
      $uibM.open({
         templateUrl: 'Event/editCnvDlg.template.html',
         scope: $scope
      }).result
      .then(function(newTitle) {
         return $http.put("/Evts/" + evtId, {title: newTitle});
      })
      .then(function() {
         return $http.get("/Evts?owner=" + $stateParams.owner);
      })
      .then(function(response) {
         $scope.evts = response.data;
      })
      .catch(function(err) {
         displayError(err);
      });
   };

   $scope.delEvt = function($index) {
      var cnvId = $scope.cnvs[$index].id;

      nDlg.show($scope, "Delete event?", "Delete Event",
       ["Yes", "No"])
      .then(function(btn) {
         if (btn === "Yes") {
            return $http.delete("/Evts/" + cnvId, {title:
            $scope.evts[$index].title});
         }
      })
      .then(function() {
         return $http.get("/Evts?owner=" + $stateParams.owner);
      })
      .then(function(response) {
         $scope.evts = response.data;
      });
   };
}]);
