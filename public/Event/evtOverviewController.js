app.controller('evtOverviewController',
 ['$scope', '$state', '$http', '$mdDialog', '$location', 'notifyDlg', 'evts',
 function($scope, $state, $http, $mdDialog, $location, nDlg, evts) {
   
   $scope.evts = evts;
   var imagePath = 'Icons/MaterialIcon.png'; 
    
   displayError = function(err) {
     if (err.data[0].tag === "dupTitle") {
         nDlg.show($scope, "Event with this title already " + 
            "exists!", "Error");
      }
   };

   $scope.newEvt = function() {
      $mdDialog.show({
         scope:$scope,
         templateUrl:'editCnvDlg.template.html',
         clickOutsideToClose: true
      })
      .then(function() {
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
         return $http.get("/Evts");
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
    
   // Helper function for filterEvt
   $scope.filterEvt = function() {

      filterQuery = "/Evts"
      var startDate = (new Date($scope.filter.startDate)).getTime();
      var endDate = (new Date($scope.filter.endDate)).getTime();
      var zip = $scope.filter.zip;
      var email = $scope.filter.email;
      
      // Create endpoint with correct query parameters
      if (startDate) {
         filterQuery = filterQuery.concat("?start=" + startDate + "&");
      }
      if (endDate) {
         if (!startDate) {
            filterQuery = filterQuery.concat("?");
         }
         filterQuery = filterQuery.concat("end=" + endDate + "&");
      }
      if (zip) {
         if (!endDate && !startDate) {
            filterQuery = filterQuery.concat("?");
         }
         filterQuery = filterQuery.concat("loc=" + zip + "&");
      }
      
      $http.get("/Prss?email=" + email)
      .then(function(response) {
         id = response.data[0].id;
         own = "owner=" + id;
         return (own)
      })
      .then(function(owner) {
         if (email) {
            if (!endDate && !startDate && !zip) {
               filterQuery = filterQuery.concat("?");
            }
            filterQuery = filterQuery.concat(owner + "&");
         }
         return (filterQuery)
      })
      .then(function(query) {
         // Remove last & of getString
         if (query.charAt(query.length - 1) === "&") {
            query = query.slice(0, -1);
         }

         return $http.get(query)
         .then(function(response) {
            $scope.evts = response.data;
         })
      })
   };
}]);
