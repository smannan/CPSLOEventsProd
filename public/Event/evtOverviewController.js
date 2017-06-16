app.controller('evtOverviewController',
 ['$scope', '$state', '$http', '$uibModal', '$mdDialog', 'mdDlg', 'evts',
 function($scope, $state, $http, $uibM, $mdDialog, mdDlg, evts) {
    $scope.states = ('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ' + 
     'ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD ' + 
     'TN TX UT VT VA WA WV WI WY').split(' ').map(function(state) {
      return {abbrev: state};
    });   
   $scope.evts = evts;
   $scope.evt = {orgId: $scope.user.prsId};

   displayError = function(err) {
     if (err && err.data && err.data[0].tag === "dupTitle") {
         nDlg.show($scope, "Event with this title already " + 
            "exists!", "Error");
      }
   };

   $scope.newEvt = function() {
      $scope.dlgTitle = "New Event";
      
      $mdDialog.show({
         controller: DialogController,
         templateUrl: 'Event/editEvtDlg.template.html',
         clickOutsideToClose:true,
         scope: $scope,
         preserveScope:true
      })
      .then(function() {
         return $http.post("/Evts", $scope.evt);
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
      
      $scope.dlgTitle = "Edit Event";
      $mdDialog.show({
         controller: DialogController,
         templateUrl: 'Event/editEvtDlg.template.html',
         parent: angular.element(document.body),
         clickOutsideToClose:true,
         scope: $scope,
         preserveScope: true
      })
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

      mdDlg.login($scope, "Delete this event?", "Delete Event",
       ["Yes", "No"])
      .then(function(btn) {
         if (btn) {
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

   function DialogController($scope, $mdDialog) {
      $scope.cancel = function() {
         $mdDialog.cancel();
      };

      $scope.submit = function() {
         $mdDialog.hide();
      };
   }; 
}]);
