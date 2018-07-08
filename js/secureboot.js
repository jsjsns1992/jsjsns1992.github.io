'use strict';
function loadJS(file, load, defer = false) {
    var scr  = document.createElement('script'),
    head = document.head || document.getElementsByTagName('head')[0];
    scr.src = file;
    scr.async = false;
    scr.defer = defer; // optionally
    if(load === true) {
        scr.addEventListener('load', function() {
            loadAngular();
        });
    }
 
    head.insertBefore(scr, head.firstChild);
}

loadJS('https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular.min.js');
loadJS('https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular-route.js');
loadJS('https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular-animate.js');
loadJS('https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular-sanitize.min.js');
loadJS('/js/videogular.min.js');
loadJS('/js/vg-controls.min.js');
loadJS('/js/vg-buffering.min.js');
loadJS('/js/vg-overlay-play.min.js', true)

function loadAngular() {
    var app = angular.module("godOfThisSite", [
                                                    "ngRoute",
                                                    "ngAnimate",
                                                    "ngSanitize",
                                                    "com.2fdevs.videogular",
                                                    "com.2fdevs.videogular.plugins.controls",
                                                    "com.2fdevs.videogular.plugins.buffering",
                                                    "com.2fdevs.videogular.plugins.overlayplay"
                                            ]);
    app.run(['$rootScope', '$route', function($rootScope, $route) {
        $rootScope.$on('$routeChangeSuccess', function() {
            document.title = $route.current.title;
        });
    }]);
    app.run(function ($rootScope, $location) {

        var history = [];
    
        $rootScope.$on('$routeChangeSuccess', function() {
            history.push($location.$$path);
        });
    
        $rootScope.back = function () {
            var prevUrl = history.length > 1 ? history.splice(-2)[0] : "/";
            $location.path(prevUrl);
        };
    
    });
    app.config(function($routeProvider) {
        $routeProvider
        .when("/", {
            title: "Fyle - Share Your Drive",
            templateUrl: "/partials/home.html",
            controller: "homeController"
        })
        .when("/legal/:cat", {
            title: "Fyle - Legal Policies",
            templateUrl: "/partials/legal.html",
            controller: "policyController" 
        })
        .when("/play/:url", {
            title: "Fyle - Video Player",
            templateUrl: '/partials/video.html',
            controller: "videoController"
        })
        .when("/:id", {
            title: "Fyle - Download Your File",
            templateUrl: function(params){ return 'https://cdn.fyle.me/api/file.php?file_hash=' + params.id; },
            controller: "fileController"
        })
    });
    app.controller('homeController', function($scope, $http, $timeout, $location){
        $scope.info = 'No Error!';
        $scope.file = {
            'id': '',
            'pass': '',
            'description': '',
            'images': []
        };
        $scope.descriptionModal = false;
        $scope.imagesModal = false;
        $scope.loadingBar = false;
        $scope.img_src = "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg";
        var itext = angular.element( document.querySelector('#status') );

        $scope.addImage = function() {
            if(!$scope.file.images.includes($scope.img_src) && $scope.img_src.match(/\.(jpeg|jpg|gif|png|svg)$/) != null) {
                $scope.file.images.push($scope.img_src);
                console.log($scope.file.images);
            }
            itext.text('Added!');
            $timeout(function() {
                itext.text('Add');
            }, 1000);
        }

        $scope.shareFile = function() {
            if($scope.file.id === '') {
                $scope.info = 'Blank Input!';
            } else {
                $scope['loadingBar'] = true;
                $scope.info = 'Generating Link...';
                $scope.file.id = $scope.file.id.match(/[-\w]{25,}/)[0];
                $http({
                    method: 'POST',
                    url: 'https://cdn.fyle.me/api/file.php',
                    data: {'id': $scope.file.id, 'password': $scope.file.pass, 'description': $scope.file.description, 'images': $scope.file.images.toString(), 'private': true},
                }).then(function (response){
                    if(response.data.length > 32) {
                        $location.path('/' + response.data);
                    } else {
                        $scope.info = 'Something Went Wrong!';
                    }
                    $scope['loadingBar'] = false;
                },function (error){
             
                });
            }
        }
        
    });

    app.controller('fileController', function($scope, $location, $http, $routeParams) {
        $scope.descriptionModal = false; 
        $scope.passwordModal = false;
        $scope.file = {
            'id': $routeParams.id,
            'password': '',
            'download_url': ''
        };
        $scope.is_password = false;
        $scope.loadingBar = false;
        $scope.info = "";

        $scope.doFile = function(click) {
            $scope.passwordModal = false;
            $scope.loadingBar = true;
            if($scope.file.password === '' && $scope.is_password) {
                $scope.file.password = '';
                $scope.info = "Password Protected!";
                $scope.loadingBar = false;
            } else {
                $http({
                    method: 'POST',
                    url: '/api/download.php',
                    data: {'id': $scope.file.id, 'password': $scope.file.password},
                }).then(function (response){
                    if (response.data.includes('googleusercontent.com')) {
                        if(click == 'play') {
                            $location.path('/play/' + encodeURIComponent(window.btoa(response.data)));
                        } else {
                            window.location = response.data;
                        }
                    } else {
                        $scope.info = response.data;
                    }
                    $scope.loadingBar = false;
                },function (error){
             
                });
                $scope.file.password = '';
            }
        }
    });

    app.controller('policyController', function($scope, $location, $http, $routeParams){
        $scope.policy_name = 'Loading..';
        if($routeParams.cat == 'terms') {
            $scope.policy_name = 'Terms And Conditions';
            $http.get('/txt/terms.txt')
                 .then(function(response) {
                     $scope.policy_text = response.data;
                 });
        }
        else if($routeParams.cat == 'privacy') {
            $scope.policy_name = 'Privacy Policy';
            $http.get('/txt/privacy.txt')
                 .then(function(response) {
                     $scope.policy_text = response.data;
                 });
        }
        else if($routeParams.cat == 'copyright') {
            $scope.policy_name = 'Copyright Policy';
            $http.get('/txt/copyright.txt')
                 .then(function(response) {
                     $scope.policy_text = response.data;
                 });
        } else {
            $location.path('/');
        }
    });
    app.controller('videoController', function($sce, $routeParams){
            var video_url = window.atob( decodeURIComponent( $routeParams.url) );
            this.config = {
                preload: "none",
                sources: [
                    {src: $sce.trustAsResourceUrl(video_url), type: "video/mp4"},
                    {src: $sce.trustAsResourceUrl(video_url), type: "video/webm"},
                    {src: $sce.trustAsResourceUrl(video_url), type: "video/ogg"}
                ],
                tracks: [],
                theme: {
                    url: "/css/videogular.min.css"
                }
            };
    });
}