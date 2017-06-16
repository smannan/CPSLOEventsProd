app.controller("evtDetailController", 
 ['$rootScope', '$scope', '$stateParams', '$state', '$http', 'notifyDlg', '$mdDialog', 'mdDlg',
 function($rs, $scope, $stateParams, $state, $http, nDlg, $mdDialog, mdDlg) {
   var evtId = $stateParams.evtId;
   var pid = $rs.user.id;
   $scope.myrsv = null;
    
   $scope.evt = {};

   displayError = function(err) {
     if (err && err.data && err.data[0].tag === "notFound") {
         nDlg.show($scope, "User does not exist!", "Error");
      }
   };

   // Get event information
   $http.get('/Evts/' + evtId)
   .then(function(response) {
      $scope.events = response.data;
      //console.log($scope.events);
      return $http.get('/Evts/' + evtId + '/Rsvs');
   })
   .then(function(response) {
      $scope.rsvs = response.data;
      //console.log($scope.rsvs);
      return getMyRsv();
   })
   .catch(function(err) {
      $scope.events = null;
      $scope.rsvs = null;
      $scope.myrsv = null;
      //console.log(err);
   });

   var getMyRsv = function () {
      return $http.get('/Prss/' + pid + '/Rsvs')
      .then(function(response) {
         $scope.myrsv = null;
         response.data.forEach(function(rsvtemp) {
            if (rsvtemp.evtId === parseInt(evtId))
               $scope.myrsv = rsvtemp;
         });
         //console.log("myrsv is " + $scope.myrsv ? " valid " : " null " );
         if ($scope.myrsv)
            console.log($scope.myrsv);
      });
   };

   $scope.checkRsv = function(s) {
      return $scope.myrsv ? $scope.myrsv.status === s : false;
   };

   $scope.changeMyRsv = function(s) {
      (function() {
         if (!$scope.myrsv) {
            return $http.post('/Evts/' + evtId + '/Rsvs', 
             {prsId: pid, evtId: evtId, status:s});
         } else {
            var rid = $scope.myrsv.id;
            return $http.put('/Prss/' + pid + '/Rsvs/' + rid, {status: s});
         }
      })()
      .then(function() {
         return $http.get('Evts/' + evtId + '/Rsvs');
      })
      .then(function(response) {
         $scope.rsvs = response.data;
         return getMyRsv();
      })
      .catch(function(err) {
         if (err.data[0].tag) {
            nDlg.show($scope, "Error: " + err.data[0].tag, "Error");
         }
      })
   };

   $scope.editEvt = function(evt) {
      var evtId = evt.id;
      
      $scope.dlgTitle = "Edit Event";
      $mdDialog.show({
         controller: DialogController,
         templateUrl: 'Event/editEvtDlg.template.html',
         parent: angular.element(document.body),
         clickOutsideToClose:true,
         scope: $scope,
         preserveScope: true
      })
      .then(function() {
         day = ((new Date($scope.evt.date)).getUTCDate())
         month = ((new Date($scope.evt.date)).getUTCMonth())
         year = ((new Date($scope.evt.date)).getUTCFullYear())
         hours = ((new Date($scope.evt.time)).getHours())
         min = ((new Date($scope.evt.time)).getMinutes())
         date = new Date(year, month, day, hours, min)
         
         $scope.evt.date = date.getTime()
         delete $scope.evt.time

         return $http.put("/Evts/" + evtId, $scope.evt);
      })
      .then(function() {
         return $http.get("/Evts");
      })
      .then(function(response) {
         $scope.events = response.data;
      })
      .catch(function(err) {
         if (err && err.data) {
            $scope.errors = err.data;
         }
      });
   };

   $scope.inviteOthers = function() {
      $scope.dlgTitle = "New Reservation";
      
      $mdDialog.show({
         controller: DialogController,
         templateUrl: 'Event/newRsvDlg.template.html',
         clickOutsideToClose:true,
         scope: $scope,
         preserveScope:true
      })
      .then(function() {
         return $http.get('/Prss?email=' + $scope.email);
      })
      .then(function(response) {
         if (!response.data.length)
            mdDlg.login($scope, "User with the email " + $scope.email +
             " was not found!", "Invalid Email", ["Okay", null]);
         else {
            var prsId = response.data[0].id;
            return $http.post('/Evts/' + evtId + '/Rsvs', {"prsId": prsId, "status": "Not Going"});
         }
      })
      .then(function() {
         return $http.get('/Evts/' + evtId + '/Rsvs');
      })
      .then(function(response) {
         $scope.rsvs = response.data;
         return getMyRsv();
      })
      .catch(function(err) {
         displayError(err);
      });
   };

   function DialogController($scope, $mdDialog) {
      $scope.cancel = function() {
         $mdDialog.cancel();
      };

      $scope.submit = function() {
         $mdDialog.hide();
      };
   };
 
   $scope.delRsv = function($index) {
      var rsv = $scope.rsvs[$index];
      return $http.delete('/Evts/' + evtId + '/Rsvs/' + rsv.id)
      .then( function() {
         return $http.get('/Evts/' + evtId + '/Rsvs');
      })
      .then(function (response) {
        $scope.rsvs = response.data;
        return getMyRsv();
      })
      .catch(function(err) {
         if (err.data[0].tag) {
            nDlg.show($scope, "Error: " + err.data[0].tag, "Error");
         }
      });
      //console.log($index);

   }
}]);

