app.controller('evtOverviewController',
 ['$scope', '$state', '$http', '$uibModal', '$mdDialog', 'mdDlg', 'evts',
 function($scope, $state, $http, $uibM, $mdDialog, mdDlg, evts) {
    $scope.states = ('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ' + 
     'ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD ' + 
     'TN TX UT VT VA WA WV WI WY').split(' ').map(function(state) {
      return {abbrev: state};
    });   
    
   $scope.evts = evts;

   displayError = function(err) {
     if (err.data[0].tag === "dupTitle") {
         nDlg.show($scope, "Event with this title already " + 
            "exists!", "Error");
      }
   };

   $scope.newEvt = function() {
      $scope.dlgTitle = "New Event";
      nDlg.show({
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
      $mdDialog.show({
         controller: DialogController,
         templateUrl: 'Event/editCnvDlg.template.html',
         parent: angular.element(document.body),
         clickOutsideToClose:true,
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
   makeQueryParams = function() {
      var getString = "/Evts";
      var startDate = $scope.filter.startDate;
      var endDate = $scope.filter.startDate;
      var zip = $scope.filter.zip;
      var email = $scope.filter.email;
      var prs; 
      
      // Create endpoint with correct query parameters
      if (startDate) {
         getString.concat("?start=" + startDate + "&");
      }
      if (endDate) {
         getString.concat("?end=" + startDate + "&");
      }
      if (zip) {
         getString.concat("?loc=" + zip + "&");
      }
      if (email) {
         prs = $http.get("/Prss?email=" + email);
         getString.concat("?owner=" + prs.id);
      }
      
      // Remove last & of getString
      if (getString.charAt(getString.length - 1) === "&")
         getString.slice(0, -1);
         
      return getString;
   };
    
   $scope.filterEvt = function($index) {
      // Endpoint that gets events with query parameters
      var getString = makeQueryParams();
      
      return $http.get(getString)
      .then(function(filtered) {
         $scope.evts = filtered.data;
      })
      .then(function() {
      });
   };
    
   function DialogController($scope, $mdDialog) {
      $scope.hide = function() {
         $mdDialog.hide();
      };

      $scope.cancel = function() {
         $mdDialog.cancel();
      };

      $scope.answer = function(answer) {
         $mdDialog.submit(answer);
      };
   }; 
}]);
