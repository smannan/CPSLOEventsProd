app.controller('evtOverviewController',
 ['$scope', '$state', '$http', '$uibModal', '$mdDialog', 'mdDlg', 'evts',
 function($scope, $state, $http, $uibM, $mdDialog, mdDlg, evts) {
    $scope.states = ('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ' + 
     'ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD ' + 
     'TN TX UT VT VA WA WV WI WY').split(' ').map(function(state) {
      return {abbrev: state};
    });   
   $scope.evts = evts;
   $scope.evt = {};

   displayError = function(err) {
     if (err && err.data && err.data[0].tag === "dupTitle") {
         mdDlg.login($scope, "Event with this title already " + 
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
         //console.log("TIME: " + $scope.evt.time);
         
         //$scope.evt.time = new Date($scope.evt.time).getTime();
         //$scope.evt.date = new Date($scope.evt.date).getTime();
         //$scope.evt.date += $scope.evt.time;
         
         //delete $scope.evt.time;

         day = ((new Date($scope.evt.date)).getUTCDate())
         month = ((new Date($scope.evt.date)).getUTCMonth())
         year = ((new Date($scope.evt.date)).getUTCFullYear())
         hours = ((new Date($scope.evt.time)).getHours())
         min = ((new Date($scope.evt.time)).getMinutes())
         date = new Date(year, month, day, hours, min)

         $scope.evt.date = date.getTime();
         delete $scope.evt.time;

         return $http.post("/Evts", $scope.evt);
      })
      .then(function() {
         return $http.get("/Evts");
      })
      .then(function(response) {
         $scope.evt = {};
         $scope.evts = response.data;
      })
      .catch(function(err) {
         if (err && err.data) {
            $scope.errors = err.data;
         }
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
         preserveScope:true
      })
      .then(function(newTitle) {
         if ($scope.evt.date) {
            day = ((new Date($scope.evt.date)).getUTCDate());
            month = ((new Date($scope.evt.date)).getUTCMonth());
            year = ((new  Date($scope.evt.date)).getUTCFullYear());
            hours = ((new Date($scope.evt.time)).getHours());
            min = ((new Date($scope.evt.time)).getMinutes());
            date = new Date(year, month, day, hours, min);
            
            $scope.evt.date = date.getTime();
            delete $scope.evt.time;
            //$scope.evt.date = new Date($scope.evt.date).getTime();
         }
         
         return $http.put("/Evts/" + evtId, $scope.evt);
      })
      .then(function(response) {
         // Remove info from input fields
         for (var i in $scope.evt) {
            console.log(i);
            delete $scope.evt[i];
         }
         
         return $http.get("/Evts");
      })
      .then(function(response) {
         $scope.evts = response.data;
      })
      .catch(function(err) {
         if (err && err.data) {
            $scope.errors = err.data;
         }
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
      var filterQuery = "/Evts?"
      var startDate = (new Date($scope.filter.startDate)).getTime();
      var endDate = (new Date($scope.filter.endDate)).getTime();
      var zip = $scope.filter.zip;
      var email = $scope.filter.email;

      // Create endpoint with correct query parameters
      if (startDate) {
         filterQuery = filterQuery.concat("start=" + startDate + "&");
      }
      if (endDate) {
         filterQuery = filterQuery.concat("end=" + endDate + "&");
      }
      if (zip) {
         filterQuery = filterQuery.concat("loc=" + zip + "&");
      }
      
      $http.get("/Prss?email=" + email)
      .then(function(response) {
      	var id = -1;
      	if (email && response.data.length) {
         	id = response.data[0].id;
      	}
         if (email)
         	return "owner=" + id;
         return "";
      })
      .then(function(owner) {
         filterQuery = filterQuery.concat(owner);
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
