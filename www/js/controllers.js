angular.module('neureads.controllers', [])

.controller('AppController', function($scope, $state, $rootScope, $ionicHistory, $stateParams) {
    if ($stateParams.clear) {
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
    }

    $scope.logout = function() {
        Parse.User.logOut();
        $rootScope.user = null;
        $rootScope.isLoggedIn = false;
        $state.go('welcome', {
            clear: true
        });
    };
})

.controller('WelcomeController', function($scope, $state, $rootScope, $ionicHistory, $stateParams) {
    if ($stateParams.clear) {
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
    }

    $scope.signin = function() {
        $state.go('signin');
    };

    $scope.signup = function() {
        $state.go('signup');
    };

    $scope.browse = function() {
        $state.go('browse');
    };

    if ($rootScope.isLoggedIn) {
        $state.go('browse');
    }
})

.controller('BrowseController', function($scope, $state, $rootScope) {

    var _images = [];
    var _authors = [];
    var _books = [];
    var _categories = [];
    var _us_urls = [];
    var _uk_urls = [];
    var _ids = [];
    var _favourites = [];

    var Book = Parse.Object.extend("Book");

    if($rootScope.is_favourites) {
        $rootScope.is_favourites = false;
        var relation = _user.relation("favourites");
        var query = relation.query();
    }
    else if ($rootScope.category) {
        category = $rootScope.category;
        $rootScope.category = null;
        query = new Parse.Query(Book);
        query.equalTo('Book_Category', category.id);
    }
    else {
        query = new Parse.Query(Book);
    }

    query.find({
        success: function(results) {
            for(i in results) {
                var obj = results[i];
                _ids.push(obj.id);
                _images.push(obj.get("Image"));
                _books.push(obj.get("Name"));
                obj.get("US_URL") && _us_urls.push(obj.get("US_URL"));
                !obj.get("US_URL") && _us_urls.push('');
                obj.get("UK_URL") && _uk_urls.push(obj.get("UK_URL"));
                !obj.get("UK_URL") && _uk_urls.push('');

                var relation = obj.relation("Book_Author");
                var query = relation.query();
                query.find({
                    success : function(res) {
                        _authors.push(res[0].get("Name"));
                        $scope.author_name = _authors[0];
                    },
                    error : function(error) { }
                });

                var relation = obj.relation("Book_Category");
                var query = relation.query();
                query.find({
                    success : function(res) {
                        _categories.push(res[0].get("Name"));
                        $scope.category_name = _categories[0];
                    },
                    error : function(error) { }
                });
            }
            $scope.images = _images;
            $scope.authors = _authors;
            $scope.books = _books;
            $scope.categories = _categories;
            $scope.book_ids = _ids;

            $scope.book_name = _books[0];
            $scope.book_id = _ids[0];

            $rootScope.us_url = _us_urls[0];
            $rootScope.uk_url = _uk_urls[0];

        },
        error: function(error) {
        }
    });

    var _user = Parse.User.current();

    if(_user) {
      _favourites = [];
      relation = _user.relation("favourites");
      query = relation.query();
      query.find({
          success : function(results) {
              for(i in results) {
                  var obj = results[i];
                  _favourites.push(obj.id);
              }
              $scope.favourites = _favourites;
          },
          error : function(error) { }
      });
    }

    $scope.slideHasChanged = function(index) {
        $scope.author_name = $scope.authors[index];
        $scope.book_name = $scope.books[index];
        $scope.category_name = $scope.categories[index];
        $scope.book_id = $scope.book_ids[index];
        $rootScope.uk_url = _uk_urls[index];
        $rootScope.us_url = _us_urls[index];

    };

    $scope.details = function() {
        $state.go('details');
    };

    $scope.addFavourites = function(bookId) {
        _favourites = [];
        var Book = Parse.Object.extend("Book");
        var _user = Parse.User.current();
        var _book = new Book();
        _book.id = bookId;

        var relation = _user.relation("favourites");
        var query = relation.query();
        query.find({
            success : function(results) {
                for(i in results) {
                    var obj = results[i];
                    _favourites.push(obj.id);
                }
                $scope.favourites = _favourites;

                if(_favourites.indexOf(bookId) > -1) { relation.remove(_book); $scope.favourites.splice($scope.favourites.indexOf(bookId),1); }
                else { relation.add(_book); $scope.favourites.push(bookId); }
                _user.save();
            },
            error : function(error) { }
        });
    };

})

.controller('DetailController', function($scope, $state, $rootScope, $ionicHistory) {
    $scope.goBack = function() {
        $ionicHistory.goBack();
    };
})

.controller('LoginController', function($scope, $state, $rootScope, $ionicLoading) {
    $scope.user = {
        username: null,
        password: null
    };

    $scope.error = {};

    $scope.login = function() {
        $scope.loading = $ionicLoading.show({
            content: 'Signing in',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });

        var user = $scope.user;
        Parse.User.logIn(('' + user.username).toLowerCase(), user.password, {
            success: function(user) {
                $ionicLoading.hide();
                $rootScope.user = user;
                $rootScope.isLoggedIn = true;
                $state.go('browse', {
                    clear: true
                });
            },
            error: function(user, err) {
                $ionicLoading.hide();
                // The login failed. Check error to see why.
                if (err.code === 101) {
                    $scope.error.message = 'Invalid login credentials';
                } else {
                    $scope.error.message = 'An unexpected error has ' +
                        'occurred, please try again.';
                }
                $scope.$apply();
            }
        });
    };

    $scope.forgot = function() {
        $state.go('forgot');
    };
})

.controller('ForgotPasswordController', function($scope, $state, $ionicLoading) {
    $scope.user = {};
    $scope.error = {};
    $scope.state = {
        success: false
    };

    $scope.reset = function() {
        $scope.loading = $ionicLoading.show({
            content: 'Sending',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });

        Parse.User.requestPasswordReset($scope.user.email, {
            success: function() {
                // TODO: show success
                $ionicLoading.hide();
                $scope.state.success = true;
                $scope.$apply();
            },
            error: function(err) {
                $ionicLoading.hide();
                if (err.code === 125) {
                    $scope.error.message = 'Email address does not exist';
                } else {
                    $scope.error.message = 'An unknown error has occurred, ' +
                        'please try again';
                }
                $scope.$apply();
            }
        });
    };

    $scope.login = function() {
        $state.go('signin');
    };
})

.controller('RegisterController', function($scope, $state, $ionicLoading, $rootScope) {
    $scope.user = {};
    $scope.error = {};

    $scope.register = function() {

        // TODO: add age verification step

        $scope.loading = $ionicLoading.show({
            content: 'Sending',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });

        var user = new Parse.User();
        user.set("fullname", $scope.user.fullname);
        user.set("username", $scope.user.email);
        user.set("password", $scope.user.password);
        user.set("email", $scope.user.email);

        user.signUp(null, {
            success: function(user) {
                $ionicLoading.hide();
                $rootScope.user = user;
                $rootScope.isLoggedIn = true;
                $state.go('browse', {
                    clear: true
                });
            },
            error: function(user, error) {
                $ionicLoading.hide();
                if (error.code === 125) {
                    $scope.error.message = 'Please specify a valid email ' +
                        'address';
                } else if (error.code === 202) {
                    $scope.error.message = 'The email address is already ' +
                        'registered';
                } else {
                    $scope.error.message = error.message;
                }
                $scope.$apply();
            }
        });
    };
})

.controller('CategoriesController', function($scope, $state, $rootScope, $stateParams, $ionicHistory) {

    var _categories = [];

    var Category = Parse.Object.extend("Category");
    var query = new Parse.Query(Category);

    query.find({
        success: function(results) {
            for(i in results) {
                var category = {id: results[i].id, name:results[i].get("Name")}
                _categories.push(category);
            }

            $scope.categories = _categories;

        },
        error: function(error) {
        }
    });

    $scope.logout = function() {
        Parse.User.logOut();
        $rootScope.user = null;
        $rootScope.isLoggedIn = false;
        $state.go('landing', {
            clear: true
        });
    };

    $scope.browse = function(is_favourites, category) {

        if(is_favourites) {
            $rootScope.is_favourites = true;
            $state.go('browse', {}, {reload: true});
        }
        else if (category) {
            $rootScope.category = category;
            $state.go('browse', {}, {reload: true});
        }
        else {
            $state.go('browse', {}, {reload: true});
        }
    };

});
