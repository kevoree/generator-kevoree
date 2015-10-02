var AbstractComponent = require('kevoree-entities').AbstractComponent;

/**
 * Kevoree component
 * @type {<%= entityName %>}
 */
var <%= entityName %> = <%= entityType %>.extend({
    toString: '<%= entityName %>',

    /* This is an example of dictionary attribute that you can set for your entity */
    //dic_yourAttrName: {
    //  optional: true,
    //  defaultValue: false
    //},<%if (browserCompat) {%>

    construct: function () {
        this.onStart = function () { /* noop */ };
        this.onStop  = function () { /* noop */ };
    },<%}%>

    /**
     * this method will be called by the Kevoree platform when your component has to start
     * @param {Function} done
     */
    start: function (done) {
        this.log.debug(this.toString(), 'START');<% if (browserCompat) {%>
        this.onStart();<%}%>
        done();
    },

    /**
     * this method will be called by the Kevoree platform when your component has to stop
     * @param {Function} done
     */
    stop: function (done) {
        this.log.debug(this.toString(), 'STOP');<% if (browserCompat) {%>
        this.onStop();<%}%>
        done();
    }<% if (browserCompat) {%>,

    /**
     * this method is called by the Browser Runtime in order to retrieve
     * this component AngularJS UI controller
     */
    uiController: function () {
        return ['$scope', '$timeout', 'instance', function ($scope, $timeout, instance) {
            // this is your UI controller function
            // $scope content is available directly within the browser/kevoree-comp-foocomp.html file
            $scope.started = instance.started;
            $scope.foo = 'bar';
            $scope.value = parseInt(Math.random()*100);
            $scope.genValue = function () {
                $scope.value = parseInt(Math.random()*100);
            };

            instance.onStart = function () {
                $timeout(function () {
                    $scope.started = true;
                });
            };

            instance.onStop = function () {
                $timeout(function () {
                    $scope.started = false;
                });
            };
        }];
    }<%}%>
});

module.exports = <%= entityName %>;
