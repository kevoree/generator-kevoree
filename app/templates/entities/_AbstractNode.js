var JavascriptNode = require('kevoree-node-javascript');

/**
 * Kevoree node
 * @type {<%= tdef.name %>}
 */
var <%= tdef.name %> = JavascriptNode.extend({
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
    } %>
    
    /**
     * this method will be called by the Kevoree platform when your group has to start
     * @param {Function} done
     */
    start: function (done) {
        this.log.debug(this.toString(), 'START');
        done();
    },

    /**
     * this method will be called by the Kevoree platform when your group has to stop
     * @param {Function} done
     */
    stop: function (done) {
        this.log.debug(this.toString(), 'STOP');
        done();
    }
});

module.exports = <%= tdef.name %>;
