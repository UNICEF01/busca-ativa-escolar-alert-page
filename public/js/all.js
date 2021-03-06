angular.module("BuscaAtivaEscolarAlert", ['ngResource',
    'ui.bootstrap',
    'ui.select',
    'ui.utils.masks',
    'pathgather.popeye'
]);

angular.module('BuscaAtivaEscolarAlert')
    .service('config', function () {

        //Altera a url dinamicamente de acordo com o ambiente.
        var APIEndpoint = "https://api.buscaativaescolar.org.br/api/v1/";

        if ('alerta.buscaativaescolar.test' === location.host) {
            var APIEndpoint = "http://api.busca-ativa-escolar.test/api/v1/";
        }

        if ('alerta.testes.buscaativaescolar.org.br' === location.host) {
            var APIEndpoint = "https://api.testes.buscaativaescolar.org.br/api/v1/";
        }

        if (window.ENVIRONMENT) {
            APIEndpoint = window.ENVIRONMENT.ENDPOINT_URL;
        }

        console.log("[env] Using endpoint: ", APIEndpoint, window.ENVIRONMENT);

        return {
            getAPIEndpoint: function () {
                return APIEndpoint;
            },
        };
    });

angular.module("BuscaAtivaEscolarAlert").controller("formCtrl", function ($rootScope, $scope, $http, Cities, StaticData, Popeye, config) {
    $scope.static = StaticData;
    $rootScope.class = "state-not-submitted";
    $scope.endpoint = config.getAPIEndpoint();

    $scope.modal = function (valid, alert) {

        $rootScope.isValid = valid;
        $rootScope.alert = alert;

        var modal = Popeye.openModal({
            templateUrl: "confirm-dialog.html",
            controller: "formCtrl",
            closed: {}
        });
    };

    $scope.fetchCities = function (query) {
        var data = {name: query, $hide_loading_feedback: true};
        if ($scope.alert.place_uf) data.uf = $scope.alert.place_uf;

        console.log("[create_alert] Looking for cities: ", data);

        return Cities.search(data).$promise.then(function (res) {
            return res.results;
        });
    };

    $scope.renderSelectedCity = function (city) {
        if (!city) return '';
        return city.uf + ' / ' + city.name;
    };

    $scope.createAlert = function () {

        if ($rootScope.isValid) {

            var data = {
                email: $rootScope.alert.email,
                name: $rootScope.alert.name,
                place_reference: $rootScope.alert.place_reference,
                alert_cause_id: $rootScope.alert.alert_cause_id,
                mother_name: $rootScope.alert.mother_name,
                place_address: $rootScope.alert.place_address,
                place_neighborhood: $rootScope.alert.place_neighborhood,
                place_city_id: $rootScope.alert.place_city.ibge_city_id,
                place_city_name: $rootScope.alert.place_city.name,
                place_uf: $rootScope.alert.place_uf
            };

            // if (typeof $rootScope.alert.dob !== "undefined") {
            //     var dateBirth = new Date($rootScope.alert.dob);
            //     dateBirth = dateBirth.toLocaleDateString("eu-ES");
            //
            //     console.log(dateBirth);
            //     data.dob = dateBirth;
            // }

            var config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            return $http.post($scope.endpoint + "integration/lp/alert_spawn", JSON.stringify(data), config).then(function (success) {
                if (success.data.reason == "invalid_user") {
                    console.log(success.data.reason);
                    console.log(success.data.reason == "invalid_user");
                    Popeye.closeCurrentModal();
                    alert("Usuario não cadastrado");
                } else {
                    $rootScope.class = "state-submitted-successfully";
                    Popeye.closeCurrentModal();
                    console.log(success);
                }
            });


        } else {
            Popeye.closeCurrentModal();
            console.log('Invalid form');
        }

    };
});

angular.module('BuscaAtivaEscolarAlert')
    .filter('orderObjectBy', function () {
        return function (items, field, reverse) {
            var filtered = [];

            angular.forEach(items, function (item) {
                filtered.push(item);
            });

            filtered.sort(function (a, b) {
                return (a[field] > b[field] ? 1 : -1);
            });

            if (reverse) filtered.reverse();

            return filtered;
        };
    })
    .factory('Cities', function Cities($resource, config) {
        headers = {};

        return $resource(config.getAPIEndpoint() + 'cities/:id', {id: '@id'}, {
            find: {method: 'GET', headers: headers},
            search: {url: config.getAPIEndpoint() + 'cities/search', method: 'POST', headers: headers},
            checkIfAvailable: {
                url: config.getAPIEndpoint() + 'cities/check_availability',
                method: 'POST',
                headers: headers
            },

        });

    });

angular.module('BuscaAtivaEscolarAlert').factory('StaticData', function StaticData($rootScope, $http, config) {

    var data = {};
    var self = this;

    var dataFile = config.getAPIEndpoint() + "static/static_data?version=latest";
    var $promise = {};

    function fetchLatestVersion() {
        console.log("[platform.static_data] Downloading latest static data definitions...");
        console.log(dataFile);
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

    function getAlertCauses() {
        return (data.AlertCause) ? data.AlertCause : [];
    }

    function getUFs() {
        return (data.UFs) ? data.UFs : [];
    }

    function getAPIEndpoints() {
        return (data.APIEndpoints) ? data.APIEndpoints : [];
    }

    function getAllowedMimeTypes() {
        return (data.Config) ? data.Config.uploads.allowed_mime_types : [];
    }

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