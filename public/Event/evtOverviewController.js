app.controller('evtOverviewController',
 ['$scope', '$state', '$http', '$uibModal', 'notifyDlg', 'evts',
 function($scope, $state, $http, $uibM, nDlg, evts) {
   $scope.evts = evts;
    var imagePath = 'Icons/MaterialIcon.png';
    
    // Hard coded events
    $scope.dumbEvts = [
      {
         face: imagePath, 
         evtName: "Event 1",
         organizer: 'adm@11.com',
         time: '3:08PM',
         date: 'June 14, 2017',
         location: 'Cal Poly',
         evtDesc: "This is some random description for this event.",
      },
      {
         face: imagePath, 
         evtName: "Event 2",
         organizer: 'adm@11.com',
         time: '3:08PM',
         date: 'June 14, 2017',
         location: 'Cal Poly',
         evtDesc: "This is some random description for this event.",
      },
      {
         face: imagePath, 
         evtName: "Event 3",
         organizer: 'adm@11.com',
         time: '3:08PM',
         date: 'June 14, 2017',
         location: 'Cal Poly',
         evtDesc: "This is some random description for this event.",
      },
      {
         face: imagePath, 
         evtName: "Event 4",
         organizer: 'adm@11.com',
         time: '3:08PM',
         date: 'June 14, 2017',
         location: 'Cal Poly',
         evtDesc: "This is some random description for this event.",
      },
      {
         face: imagePath, 
         evtName: "Event 5",
         organizer: 'adm@11.com',
         time: '3:08PM',
         date: 'June 14, 2017',
         location: 'Cal Poly',
         evtDesc: "This is some random description for this event.",
      }
    ]; 
    
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
      });
   };
      
}]);
