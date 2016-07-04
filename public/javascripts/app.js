var app = angular.module('app', [
    'app.controllers',
    'app.services',
    'app.directives',
	'ngRoute',
    'ngAnimate',

    // 3rd party dependencies
    'btford.socket-io',
    'angular-loading-bar',
    'ui.router'
]);

// Make sure to create the modules
angular.module('app.controllers', []);
angular.module('app.services', []);
angular.module('app.directives', []);

// Routing


app.config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise("/can")
      
    $stateProvider

        .state('can', {
            url: "/can",
            templateUrl: 'pages/can/index.jade',
            controller: 'canController',
            redirectTo: 'can.log',
        })

        .state('can.log', {
            url: "/log",
            views: {
                "content": {
                    templateUrl: 'pages/can/log.jade'
                },
            },
        })
        .state('can.send', {
            url: "/send",
            views: {
                "content": {
                    templateUrl: 'pages/can/send.jade'
                },
                
            },
        })
        .state('can.scan', {
            url: "/scan",
            views: {
                "content": {
                    templateUrl: 'pages/can/scan.jade'
                },
                
            },
        })

        .state('page2', {
            url: "/page2",
            templateUrl: 'pages/page2/index.jade',
        })

});

app.run(['$rootScope', '$state', function($rootScope, $state) {

    $rootScope.$on('$stateChangeStart', function(evt, to, params) {
        if (to.redirectTo) {
            evt.preventDefault();
            $state.go(to.redirectTo, params, {location: 'replace'})
        }
    });
}]);




Array.prototype.move = function (old_index, new_index) {
    if (new_index >= this.length) {
        var k = new_index - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
    return this; // for testing purposes
};