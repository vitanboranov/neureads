// Neureads

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('neureads',
        [ 'ionic', 'neureads.controllers']
    )

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('browse', {
      url: "/browse",
      templateUrl: 'templates/browse.html',
      controller: 'BrowseController'
  })

  .state('details', {
      url: "/details",
      templateUrl: 'templates/details.html',
      controller: 'DetailController'
  })

  .state('landing', {
      url: "/landing",
      templateUrl: 'templates/landing.html',
      controller: 'WelcomeController'
  })

  .state('signin', {
      url: "/signin",
      templateUrl: 'templates/signin.html',
      controller: 'LoginController'
  })

  .state('signup', {
      url: "/signup",
      templateUrl: 'templates/signup.html',
      controller: 'RegisterController'
  })

  .state('forgot', {
      url: "/forgot",
      templateUrl: 'templates/forgot.html',
      controller: 'ForgotPasswordController'
  })

  .state('about', {
      url: "/about",
      templateUrl: 'templates/about.html'
  })

  .state('categories', {
      url: "/categories",
      templateUrl: 'templates/categories.html',
      controller: 'CategoriesController'
  })

  $urlRouterProvider.otherwise('/landing');
})

.run(function ($state, $rootScope) {
    Parse.initialize('hWNyVfeLgQETDqCZuGlOeBd8QZRdx5QKZFjDbMaD', '46sC2IrpaDHTtDMssb3cBskOlcHmWN9zNNKOCZGj');
    var currentUser = Parse.User.current();
    $rootScope.user = null;
    $rootScope.isLoggedIn = false;

    if (currentUser) {
        $rootScope.user = currentUser;
        $rootScope.isLoggedIn = true;
        $state.go('browse');
    }
});
