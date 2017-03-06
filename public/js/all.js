angular.module("BuscaAtivaEscolarAlert", ['ngResource',
            'ui.bootstrap',
            'ui.select',
]);

angular.module("BuscaAtivaEscolarAlert").controller("formCtrl", function ($scope, $http, Cities, StaticData ) {
    
    $scope.static = StaticData;
  $scope.greet = function() {
    $window.alert('Hello ' + $scope.name);
  };

    $scope.fetchCities = function(query) {
        var data = {name: query, $hide_loading_feedback: true};
        if($scope.alert.place_uf) data.uf = $scope.alert.place_uf;

        console.log("[create_alert] Looking for cities: ", data);

        return Cities.search(data).$promise.then(function (res) {
            return res.results;
        });
    };

    $scope.renderSelectedCity = function(city) {
        if(!city) return '';
        return city.uf + ' / ' + city.name;
    };
    
    $scope.createAlert = function (alert) {
        console.log("iam alive");
        $http.post("http://api.busca-ativa-escolar.dev.lqdi.net/api/v1/integration/lp/alert_spawn", alert).success(function (data) {
             console.log("iam alive");
        });
    };


});


angular.module('BuscaAtivaEscolarAlert').factory('Cities', function Cities($resource) {
      headers = {};

     return $resource('http://api.busca-ativa-escolar.dev.lqdi.net/api/v1/cities/:id', {id: '@id'}, {
         find: {method: 'GET', headers: headers},
         search: {url: 'http://api.busca-ativa-escolar.dev.lqdi.net/api/v1/cities/search', method: 'POST', headers: headers},
         checkIfAvailable: {url: 'http://api.busca-ativa-escolar.dev.lqdi.net/api/v1/cities/check_availability', method: 'POST', headers: headers},
     });
});

angular.module('BuscaAtivaEscolarAlert').factory('StaticData', function StaticData($rootScope, $http) {

            var data = {};
            var self = this;

            var dataFile = "http://api.busca-ativa-escolar.dev.lqdi.net/api/v1/static/static_data?version=latest";
            var $promise = {};

            function fetchLatestVersion() {
                console.log("[platform.static_data] Downloading latest static data definitions...");
                $promise = $http.get(dataFile).then(onFetch);
            }

            function refresh() {
                fetchLatestVersion();
            }

            function onFetch(res) {
                console.log("[platform.static_data] Downloaded! Version=", res.data.version, "Timestamp=", res.data.timestamp, "Data=", res.data.data);
                data = res.data.data;

                $rootScope.$broadcast('StaticData.ready');
            }

            function getDataFile() {
                return dataFile;
            }

            function getNumChains() {
                return data.length ? data.length : 0;
            }

            function isReady() {
                return getNumChains() > 0;
            }

            function getAlertCauses() { return (data.AlertCause) ? data.AlertCause : []; }            
            function getUFs() { return (data.UFs) ? data.UFs : []; }
            function getAPIEndpoints() { return (data.APIEndpoints) ? data.APIEndpoints : []; }
            function getAllowedMimeTypes() { return (data.Config) ? data.Config.uploads.allowed_mime_types: []; }

            return {
                fetchLatestVersion: fetchLatestVersion,
                refresh: refresh,
                getAlertCauses: getAlertCauses,
                getAllowedMimeTypes: getAllowedMimeTypes,
                getUFs: getUFs,
                getAPIEndpoints: getAPIEndpoints,
                isReady: isReady,
                getNumChains: getNumChains,
                getDataFile: getDataFile,
            };

        })
        .run(function (StaticData) {
            StaticData.refresh();
        });

