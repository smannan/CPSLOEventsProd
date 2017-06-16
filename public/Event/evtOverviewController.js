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

         var day = $scope.date2.getUTCDate()
         var month = $scope.date2.getUTCMonth()
         var year = $scope.date2.getUTCFullYear()
         var hours = $scope.time.getHours()
         var min = $scope.time.getMinutes()
         var date = new Date(year, month, day, hours, min)
         
         $scope.evt.date = date.getTime()
         return $http.post("/Evts", $scope.evt);
      })
      .then(function() {
         var url = "/Evts";
         if ($state.params && $state.params.prsId)
            url += "?owner=" + $state.params.prsId;
         return $http.get(url);
      })
      .then(function(response) {
         $scope.evt = {};
         $scope.evts = response.data;
      })
      .catch(function(err) {
         if (err && err.data) {
            $scope.errors = err.data;
         }
         $scope.errors = [];
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
         if ($scope.date2) {
            var day = $scope.date2.getUTCDate()
            var month = $scope.date2.getUTCMonth()
            var year = $scope.date2.getUTCFullYear()
            var hours = $scope.time.getHours()
            var min = $scope.time.getMinutes()
            var date = new Date(year, month, day, hours, min)
            
            $scope.evt.date = date.getTime()
         }
         console.log($scope.evt)
         return $http.put("/Evts/" + evtId, $scope.evt);
      })
      .then(function(response) {
         var url = "/Evts";
         if ($state.params && $state.params.prsId) 
            url += "?owner=" + $state.params.prsId;
         // Remove info from input fields
         for (var i in $scope.evt) {
            delete $scope.evt[i];
         }
         
         return $http.get(url);
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
    
   $scope.resetFilter = function() {
      // Remove inform from filter input fields
      for (var i in $scope.filter) {
         delete $scope.filter[i];
      }
      
      $http.get('Evts')
      .then(function(response) {
         $scope.evts = response.data;
      })
   };
}]);
