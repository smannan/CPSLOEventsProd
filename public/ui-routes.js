app.config(['$stateProvider', '$urlRouterProvider',
   function($stateProvider, $router) {
      // Redirect to home if path is not matched
      $router.otherwise("/");

      $stateProvider
      .state('home', {
         url: '/',
         templateUrl: 'Home/home.template.html',
         controller: 'homeController',
      })
      .state('login', {
         url: '/login',
         templateUrl: 'Login/login.template.html',
         controller: 'loginController',
      })
      .state('logout', {
         url: '/login',
         templateUrl: 'Home/home.template.html',
         controller: 'logoutController',
      })
      .state('register', {
         url: '/register',
         templateUrl: 'Register/register.template.html',
         controller: 'registerController',
      })
      .state('rsvsOverview', {
         url: '/Prss/:prsId/Rsvs',
         templateUrl: 'Reservation/rsvsOverview.template.html',
         controller: 'rsvsOverviewController',
         resolve: {
            /*rsvs: ['$q', '$http', '$stateParams', 
             function($q, $http, $stateParams) {
               return $http.get("Prss/:prsId/Rsvs")
               .then(function(response) {
                  return response.data;
               });
            }]*/
         },
      })
      .state('evtPrsOverview', {
         url: '/myEvts/:prsId', //TODO: Query param needs to go after myEvts
         templateUrl: 'Event/evtOverview.template.html',
         controller: 'evtOverviewController',
         resolve: {
            evts: ['$q', '$http', '$stateParams', 
             function($q, $http, $stateParams) {
               return $http.get("Evts?owner=" + $stateParams.prsId)
               .then(function(response) {
                  return response.data;
               });
            }]
         },
      })
      // Gets all public events
      .state('evtOverview', {
         url: '/evts',
         templateUrl: 'Event/evtOverview.template.html',
         controller: 'evtOverviewController',
         resolve: {
            evts: ['$q', '$http', function($q, $http) {
               return $http.get('Evts')
               .then(function(response) {
                  return response.data;
               });
            }]
         }
      })
      .state('evtDetail', {
         url:'/evts/:evtId',
         templateUrl: 'Event/evtDetail.template.html',
         controller: 'evtDetailController',
      });
   }
]);
