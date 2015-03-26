'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var _ = require('underscore.string');

var ENTITY_TYPES = ['Component', 'Channel', 'Group', 'Node'],
    ENTITY_TYPE_TAGS = {
        'Component': 'comp',
        'Channel': 'chan',
        'Group': 'group',
        'Node': 'node'
    },
    ENTITY_REAL_TYPES = {
        comp:  'AbstractComponent',
        chan:  'AbstractChannel',
        group: 'AbstractGroup',
        node:  'AbstractNode'
    };

var KevoreeGenerator = module.exports = function KevoreeGenerator(args, options, config) {
    yeoman.generators.Base.apply(this, arguments);

    this.on('end', function () {
        this.installDependencies({ skipInstall: options['skip-install'] });
    });

    this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(KevoreeGenerator, yeoman.generators.Base);

KevoreeGenerator.prototype.askFor = function askFor() {
    var cb = this.async();

    // have Yeoman greet the user.
    console.log();
    console.log(chalk.yellow('Kevoree Project Generator:'));
    console.log();

    var prompts = [
        {
            name: 'entityType',
            message: 'What kind of entity would you like to create?',
            type: 'list',
            choices: ENTITY_TYPES
        },
        {
            name: 'entityName',
            message: 'Choose a name for this entity? (Java camel case naming convention)',
            validate: function (answer) {
                var pattern = /[A-Z][\w]*/;
                if (matcher(answer, pattern)) return true;
                else return 'Allowed pattern for name is '+pattern.toString();
            }
        },
        {
            name: 'kevoreePackage',
            message: 'Choose a package name for your module? (i.e my.package.name)',
            validate: function (answer) {
                var pattern = /[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*/g;
                if (matcher(answer, pattern)) return true;
                else return 'Allowed pattern for package is '+pattern.toString();
            }
        }
    ];

    this.prompt(prompts, function (props) {
        this.rawEntityType  = ENTITY_TYPE_TAGS[props.entityType];
        this.entityType     = ENTITY_REAL_TYPES[this.rawEntityType];
        this.kevoreePackage = props.kevoreePackage;
        this.entityName     = props.entityName;
        this.fqn            = this.entityName;
        if (this.kevoreePackage !== 'org.kevoree.library') {
            this.fqn = this.kevoreePackage + '.' + props.entityName;
        }

        this.prompt([
            {
                name: 'moduleName',
                message: 'Choose your NPM module name:',
                default: 'kevoree-' + this.rawEntityType + '-' + _.slugify(this.entityName),
                validate: function (answer) {
                    var pattern = /[a-z0-9_-]+/;
                    if (matcher(answer, pattern)) return true;
                    else return 'Allowed pattern for module name is ' + pattern.toString();
                }
            },
            {
                name: 'browserCompat',
                message: 'Do you want this to be runnable by the browser runtime?',
                type: 'confirm',
                default: false
            }
        ], function (props) {
            this.moduleName = props.moduleName;
            this.browserCompat = props.browserCompat;
            this.browserUI = (this.rawEntityType === 'comp' && props.browserCompat);
            cb();
        }.bind(this));
    }.bind(this));
};

KevoreeGenerator.prototype.app = function app() {
    // common files & dirs for all entities
    this.template('_package.ejs', 'package.json');
    this.mkdir('lib');
    this.template('_README.md', 'README.md');
    this.copy('_.npmignore', '.npmignore');
    this.copy('_.gitignore', '.gitignore');
    this.mkdir('kevs');

    if (this.browserCompat) {
        this.copy('browserGruntfile.js', 'Gruntfile.js');
        if (this.browserUI) {
            this.template('_ui.html', 'browser/'+this.moduleName+'.html');
        }
    } else {
        this.copy('defaultGruntfile.js', 'Gruntfile.js');
    }

    this.template('entities/_'+this.entityType+'.ejs', 'lib/'+this.entityName+'.js');
    this.template('_'+this.rawEntityType+'Main.kevs', 'kevs/main.kevs');
};

function matcher(input, pattern) {
    var match = input.match(pattern);
    return (match && match.length && match.length == 1 && match[0] == input);
}
