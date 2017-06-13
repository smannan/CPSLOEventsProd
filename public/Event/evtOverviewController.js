app.controller('evtOverviewController',
 ['$scope', '$state', '$http', '$uibModal', 'notifyDlg', 'evts',
 function($scope, $state, $http, $uibM, nDlg, evts) {
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
         return $http.get("/Evts");
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
         return $http.get("/Cnvs");
      })
      .then(function(response) {
         $scope.evts = response.data;
      })
      .catch(function(err) {
         displayError(err);
      });
   };

   $scope.delEvt = function($index) {
      var evtId = $scope.evts[$index].id;

      nDlg.show($scope, "Delete this event?", "Delete Event",
       ["Yes", "No"])
      .then(function(btn) {
         if (btn === "Yes") {
            return $http.delete("/Evts/" + evtId, {title:
            $scope.evts[$index].title});
         }
      })
      .then(function() {
         return $http.get("/Evts/");
      })
      .then(function(response) {
         $scope.evts = response.data;
      });
   };
}]);
