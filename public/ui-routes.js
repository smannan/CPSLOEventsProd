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
      .state('register', {
         url: '/register',
         templateUrl: 'Register/register.template.html',
         controller: 'registerController',
      })
      .state('evtPrsOverview', {
         url: '/myEvts/', //TODO: Query param needs to go after myEvts
         templateUrl: 'Event/evtOverview.template.html',
         controller: 'evtPrsOverviewController',
         resolve: {
            /*cnvs: ['$q', '$http', '$stateParams', 
             function($q, $http, $stateParams) {
               return $http.get("Evt?owner=" + $stateParams.owner)
               .then(function(response) {
                  return response.data;
               });
            }]*/
         },
      })
      .state('evtOverview', {
         url: '/evts',
         templateUrl: 'Event/evtOverview.template.html',
         controller: 'evtOverviewController',
         /*resolve: {
            cnvs: ['$q', '$http', function($q, $http) {
               return $http.get('Evts')
               .then(function(response) {
                  return response.data;
               });
            }]
         }*/
      })
      .state('evtDetail', {
         url:'/evt/:evtId',
         templateUrl: 'Event/evtDetail.template.html',
         controller: 'evtDetailController',
      });
   }
]);
