app.controller('cnvPrsOverviewController',
 ['$scope', '$state', '$stateParams', '$http', '$uibModal', 'notifyDlg', 
 'cnvs',
 function($scope, $state, $stateParams, $http, $uibM, nDlg, cnvs) {
   $scope.cnvs = cnvs;
   
   displayError = function(err) {
      if (err.data[0].tag === "dupTitle") {
         nDlg.show($scope, "Conversation with this title already " + 
            "exists!", "Error");
      }
   };

   $scope.newCnv = function() {
      $scope.dlgTitle = "New Conversation";
      $uibM.open({
         templateUrl: 'Conversation/editCnvDlg.template.html',
         scope: $scope
      }).result
      .then(function(newTitle) {
         return $http.post("/Cnvs", {title: newTitle});
      })
      .then(function() {
         return $http.get("/Cnvs?owner=" + $stateParams.owner);
      })
      .then(function(response) {
         $scope.cnvs = response.data;
      })
      .catch(function(err) {
         displayError(err);
      });
   };

   $scope.editCnv = function($index) {
      var cnvId = $scope.cnvs[$index].id;

      $scope.dlgTitle = "Edit Conversation Title";
      $uibM.open({
         templateUrl: 'Conversation/editCnvDlg.template.html',
         scope: $scope
      }).result
      .then(function(newTitle) {
         return $http.put("/Cnvs/" + cnvId, {title: newTitle});
      })
      .then(function() {
         return $http.get("/Cnvs?owner=" + $stateParams.owner);
      })
      .then(function(response) {
         $scope.cnvs = response.data;
      })
      .catch(function(err) {
         displayError(err);
      });
   };

   $scope.delCnv = function($index) {
      var cnvId = $scope.cnvs[$index].id;

      nDlg.show($scope, "Delete conversation?", "Delete Conversation",
       ["Yes", "No"])
      .then(function(btn) {
         if (btn === "Yes") {
            return $http.delete("/Cnvs/" + cnvId, {title:
            $scope.cnvs[$index].title});
         }
      })
      .then(function() {
         return $http.get("/Cnvs?owner=" + $stateParams.owner);
      })
      .then(function(response) {
         $scope.cnvs = response.data;
      });
   };
}]);
