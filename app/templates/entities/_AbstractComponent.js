var AbstractComponent = require('kevoree-entities').AbstractComponent;

/**
 * Kevoree component
 * @type {<%= tdef.name %>}
 */
var <%= tdef.name %> = <%= entityType %>.extend({
    toString: '<%= tdef.name %>',<%
    // for loop
    for (var i=0; i < tdef.dictionaryType.attributes.array.length; i++) {
        // get attribute type
        var attr = tdef.dictionaryType.attributes.array[i];
        if (i===0) { %>
            
    /* This is an example of dictionary attribute that you can set for your entity */<%
        } %>
    dic_<%= attr.name %>: {
        optional: <%= attr.optional %>,<%
        // check if attribute defaultValue is set
        // if it is, then generate the appropriate javascript code
        if (attr.defaultValue.length) {
            // if attribute type is "STRING" then we need to wrap it into quotes
            if (attr.datatype === 'STRING') {%>
        <%= 'defaultValue: \''+attr.defaultValue+'\',' %><%
            // if it is not a "STRING" then we just need to print the value
            } else {%>
        <%= 'defaultValue: '+attr.defaultValue+',' %><%
            }
            // otherwise do not generate anything related to defaultValue
        } else {%>
        datatype: '<%= attr.datatype %>'<%
        }%>
    },<%
    // end for loop
    }
    // check browser compatibility and generate code accordingly
    if (browserCompat) {%>

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
    }<%= (browserCompat || tdef.required.array.length || tdef.provided.array.length) ? ',':'' %>
    <%
    // add provided ports
    for (var p=0; p < tdef.provided.array.length; p++) {
        var input = tdef.provided.array[p];%>
    in_<%= input.name %>: function (msg) {
        // TODO do something with incoming message
    }<%= (p < tdef.provided.array.length - 1 || browserCompat || tdef.required.array.length) ? ',' : '' %><%
    // end for loop
    }
    for (var q=0; q < tdef.required.array.length; q++) {
        var output = tdef.required.array[q];%>
    out_<%= output.name %>: function (msg) { /* noop */ }<%= (p < tdef.required.array.length - 1 || browserCompat)? ',':'' %><%
        // end for loop
    }
    if (browserCompat) { %>

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
    }<%
    }%>
});

module.exports = <%= tdef.name %>;
