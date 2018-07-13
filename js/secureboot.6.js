var app = angular.module("godOfThisSite", [
    "ngRoute",
    "ngAnimate",
    "ngSanitize",
    "com.2fdevs.videogular",
    "com.2fdevs.videogular.plugins.controls",
    "com.2fdevs.videogular.plugins.buffering",
    "com.2fdevs.videogular.plugins.overlayplay"
]);
app.config(['$sceDelegateProvider', function($sceDelegateProvider) {
$sceDelegateProvider.resourceUrlWhitelist([
'self',
'https://cdn.fyle.me/api/**'
]);
}]);
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
}).when("/legal/:cat", {
title: "Fyle - Legal Policies",
templateUrl: "/partials/legal.html",
controller: "policyController" 
})
.when("/play/:url", {
title: "Fyle - Video Player",
templateUrl: "/partials/video.html",
controller: "videoController"
})
.when("/:id", {
title: "Fyle - Download Your File",
templateUrl: "/partials/file.html",
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
$scope.onedrive = false;
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
if($scope.file.id.length == 34) {
$scope.onedrive = true;
}
$http({
method: 'POST',
url: 'https://cdn.fyle.me/api/file.php',
headers: {'Content-Type': 'application/x-www-form-urlencoded'},
data: {'id': $scope.file.id, 'password': $scope.file.pass, 'description': $scope.file.description, 'images': $scope.file.images.toString(), 'onedrive': $scope.onedrive.toString()},
}).then(function (response){
if(response.data.length > 32) {
$location.path('/' + response.data);
} else {
$scope.info = 'Something Went Wrong!';
}
$scope['loadingBar'] = false;
},function (error){
$scope.info = 'Something Went Wrong!';
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
'download_url': '',
'playable': false
};
$scope.loadingBar = false;
$scope.info = "";
$scope.icon = "fa-file-archive";

$scope.files = {
"video": ["mp4", "mkv", "webm", "ogg"],
"audio": ["mp3"],
"documents": ["pdf", "docx", "doc"]
}

$scope.loadFile = function() {
$scope.loadingBar = true;
$http({
method: 'GET',
url: 'https://cdn.fyle.me/api/file.php?file_hash=' + $scope.file.id,
headers: {'Content-Type': 'application/x-www-form-urlencoded'}
}).then(function (response){
$scope.response = response.data;
if(typeof $scope.response['file_name'] == "undefined"){
$location.path('/');
}
document.title = 'Fyle - ' + $scope.response['file_name'];
var file_ext = $scope.getExtensionFromFileName(response.data['file_name']);
if($scope.files['video'].indexOf(file_ext) > -1 || $scope.files['video'].toLowerCase().indexOf(file_ext) > -1) {
$scope.icon = "fa-file-video";
$scope.file.playable = true;
} else if($scope.files['audio'].indexOf(file_ext) > -1 || $scope.files['audio'].toLowerCase().indexOf(file_ext) > -1) {
$scope.icon = "fa-file-audio";
$scope.file.playable = true;
} else if($scope.files['documents'].indexOf(file_ext) > -1 || $scope.files['documents'].toLowerCase().indexOf(file_ext) > -1) {
$scope.icon = "fa-file-pdf";
}
$scope.loadingBar = false;
});
}

$scope.passwordClick = function() {
$scope.passwordModal = !$scope.passwordModal;
}

$scope.getExtensionFromFileName = function(x) {
return x.split('.').pop();
}

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
url: 'https://cdn.fyle.me/api/download.php',
headers: {'Content-Type': 'application/x-www-form-urlencoded'},
data: {'id': $scope.file.id, 'password': $scope.file.password},
}).then(function (response){
if(!response.data) {
$scope.info = "Something Went Wrong!!";
} else {
if (response.data.includes('googleusercontent.com') || response.data.includes('sharepoint.com')) {
if(click == 'play') {
$location.path('/play/' + encodeURIComponent(window.btoa(response.data)));
} else {
var downloadLink = angular.element('<a></a>');
downloadLink.attr('href', response.data);
downloadLink.attr('target', '_self');
downloadLink.attr('download', $scope.response['file_name']);
downloadLink[0].click();
}
} else {
$scope.info = response.data;
}
}
$scope.loadingBar = false;
},function (error){
$scope.info = 'Something Went Wrong!';
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