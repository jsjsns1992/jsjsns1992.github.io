var app = angular.module("godOfThisSite", ["ngRoute", "ngAnimate", "ngSanitize", "com.2fdevs.videogular", "com.2fdevs.videogular.plugins.controls", "com.2fdevs.videogular.plugins.buffering", "com.2fdevs.videogular.plugins.overlayplay"]);
app.config(["$sceDelegateProvider", function(e) {
    e.resourceUrlWhitelist(["self", "https://cdn.fyle.me/api/**"])
}]), app.run(["$rootScope", "$route", function(e, o) {
    e.$on("$routeChangeSuccess", function() {
        document.title = o.current.title
    })
}]), app.run(function(e, o) {
    var i = [];
    e.$on("$routeChangeSuccess", function() {
        i.push(o.$$path)
    }), e.back = function() {
        var e = i.length > 1 ? i.splice(-2)[0] : "/";
        o.path(e)
    }
}), app.config(function(e) {
    e.when("/", {
        title: "Fyle - Share Your Drive",
        templateUrl: "/partials/home.html",
        controller: "homeController"
    }).when("/onedrive", {
        title: "Fyle - Share Your OneDrive",
        templateUrl: "/partials/home.html",
        controller: "homeController"
    }).when("/legal/:cat", {
        title: "Fyle - Legal Policies",
        templateUrl: "/partials/legal.html",
        controller: "policyController"
    }).when("/play/:url", {
        title: "Fyle - Video Player",
        templateUrl: "/partials/video.html",
        controller: "videoController"
    }).when("/:id", {
        title: "Fyle - Download Your File",
        templateUrl: "/partials/file.html",
        controller: "fileController"
    })
}), app.controller("homeController", function(e, o, i, t) {
    e.info = "No Error!", e.file = {
        id: "",
        pass: "",
        description: "",
        images: []
    }, e.onedrive = !1, e.descriptionModal = !1, e.imagesModal = !1, e.loadingBar = !1, e.img_src = "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg";
    var n = angular.element(document.querySelector("#status"));
    e.addImage = function() {
        e.file.images.includes(e.img_src) || null == e.img_src.match(/\.(jpeg|jpg|gif|png|svg)$/) || (e.file.images.push(e.img_src), console.log(e.file.images)), n.text("Added!"), i(function() {
            n.text("Add")
        }, 1e3)
    }, e.shareFile = function() {
        "" === e.file.id ? e.info = "Blank Input!" : (e.loadingBar = !0, e.info = "Generating Link...", "#!/onedrive" == window.location.hash && (e.onedrive = !0), e.file.id = e.file.id.match(/[-\w]{25,}/)[0], o({
            method: "POST",
            url: "https://cdn.fyle.me/api/file.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            data: {
                id: e.file.id,
                password: e.file.pass,
                description: e.file.description,
                images: e.file.images.toString(),
                onedrive: e.onedrive.toString()
            }
        }).then(function(o) {
            o.data.length > 32 ? t.path("/" + o.data) : e.info = "Something Went Wrong!", e.loadingBar = !1
        }, function(o) {
            e.info = "Something Went Wrong!"
        }))
    }
}), app.controller("fileController", function(e, o, i, t) {
    e.descriptionModal = !1, e.passwordModal = !1, e.file = {
        id: t.id,
        password: "",
        download_url: ""
    }, e.loadingBar = !1, e.info = "", e.icon = "fa-file-archive", e.files = {
        video: ["mp4", "mkv", "webm", "ogg"],
        audio: ["mp3"],
        documents: ["pdf", "docx", "doc"]
    }, e.loadFile = function() {
        e.loadingBar = !0, i({
            method: "GET",
            url: "https://cdn.fyle.me/api/file.php?file_hash=" + e.file.id,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).then(function(o) {
            e.response = o.data, document.title = "Fyle - " + o.data.file_name;
            var i = e.getExtensionFromFileName(o.data.file_name);
            e.files.video.indexOf(i) > -1 ? e.icon = "fa-file-video" : e.files.audio.indexOf(i) > -1 ? e.icon = "fa-file-audio" : e.files.documents.indexOf(i) > -1 && (e.icon = "fa-file-pdf"), e.loadingBar = !1
        })
    }, e.passwordClick = function() {
        e.passwordModal = !e.passwordModal
    }, e.getExtensionFromFileName = function(e) {
        return e.substring(e.indexOf(".") + 1)
    }, e.doFile = function(t) {
        e.passwordModal = !1, e.loadingBar = !0, "" === e.file.password && e.is_password ? (e.file.password = "", e.info = "Password Protected!", e.loadingBar = !1) : (i({
            method: "POST",
            url: "https://cdn.fyle.me/api/download.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            data: {
                id: e.file.id,
                password: e.file.password
            }
        }).then(function(i) {
            i.data.includes("googleusercontent.com") || i.data.includes("sharepoint.com") ? "play" == t ? o.path("/play/" + encodeURIComponent(window.btoa(i.data))) : window.location = i.data : e.info = i.data, e.loadingBar = !1
        }, function(o) {
            e.info = "Something Went Wrong!"
        }), e.file.password = "")
    }
}), app.controller("policyController", function(e, o, i, t) {
    e.policy_name = "Loading..", "terms" == t.cat ? (e.policy_name = "Terms And Conditions", i.get("/txt/terms.txt").then(function(o) {
        e.policy_text = o.data
    })) : "privacy" == t.cat ? (e.policy_name = "Privacy Policy", i.get("/txt/privacy.txt").then(function(o) {
        e.policy_text = o.data
    })) : "copyright" == t.cat ? (e.policy_name = "Copyright Policy", i.get("/txt/copyright.txt").then(function(o) {
        e.policy_text = o.data
    })) : o.path("/")
}), app.controller("videoController", function(e, o) {
    var i = window.atob(decodeURIComponent(o.url));
    this.config = {
        preload: "none",
        sources: [{
            src: e.trustAsResourceUrl(i),
            type: "video/mp4"
        }, {
            src: e.trustAsResourceUrl(i),
            type: "video/webm"
        }, {
            src: e.trustAsResourceUrl(i),
            type: "video/ogg"
        }],
        tracks: [],
        theme: {
            url: "/css/videogular.min.css"
        }
    }
});