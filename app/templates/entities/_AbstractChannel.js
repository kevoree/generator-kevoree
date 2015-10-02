var AbstractChannel = require('kevoree-entities').AbstractChannel;

/**
 * Kevoree channel
 * @type {<%= tdef.name %>}
 */
var <%= tdef.name %> = <%= entityType %>.extend({
    toString: '<%= tdef.name %>',

    /* This is an example of dictionary attribute that you can set for your entity */
    dic_yourAttrName: {
        optional: false,
        defaultValue: 'someValue'
    },<%
    if (tdef.dictionaryType) {
        // for loop
        for (var i=0; i < tdef.dictionaryType.attributes.array.length; i++) {
            // get attribute type
            var attr = tdef.dictionaryType.attributes.array[i]; %>
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
    // end if
    } %>

    /**
     * this method will be called by the Kevoree platform when your channel has to start
     * @param {Function} done
     */
    start: function (done) {
        this.log.debug(this.toString(), 'START');
        done();
    },

    /**
     * this method will be called by the Kevoree platform when your channel has to stop
     * @param {Function} done
     */
    stop: function (done) {
        this.log.debug(this.toString(), 'STOP');
        done();
    },

    /**
    * When a channel is bound with an output port this method will be called when a message is sent
    *
    * @param fromPortPath port that sends the message
    * @param destPortPaths port paths of connected input port that should receive the message
    * @param msg
    * @param callback
    */
    onSend: function (fromPortPath, destPortPaths, msg, callback) {
        this.log.debug(this.toString(), 'TODO send message to all destPort');
        // TODO
    }
});

module.exports = <%= tdef.name %>;
