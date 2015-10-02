var util = require('util'),
    path = require('path'),
    yeoman = require('yeoman-generator'),
    chalk = require('chalk'),
    _ = require('underscore.string'),
    kreg = require('kevoree-registry-client'),
    kevoree = require('kevoree-library'),
    semver = require('semver');

var ENTITY_TYPES = ['Component', 'Channel', 'Group', 'Node'],
    ENTITY_TYPE_TAGS = {
        'Component': 'comp',
        'Channel': 'chan',
        'Group': 'group',
        'Node': 'node'
    },
    ENTITY_REAL_TYPES = {
        comp: 'AbstractComponent',
        chan: 'AbstractChannel',
        group: 'AbstractGroup',
        node: 'AbstractNode'
    };

function matcher(input, pattern) {
    var match = input.match(pattern);
    return (match && match.length && match.length === 1 && match[0] === input);
}

function fqnToPath(fqn) {
    var path = '/packages[';
    var splitted = fqn.split('/');
    fqn = splitted[0].split('.');
    var version = splitted[1] || '*';
    var type = fqn.pop();
    return path + fqn.join(']/packages[') + ']/typeDefinitions[name='+type+',version='+version+']';
}

var KevoreeGenerator = module.exports = function KevoreeGenerator(args, options) {
    yeoman.generators.Base.apply(this, arguments);

    this.on('end', function() {
        this.installDependencies({
            skipInstall: options['skip-install']
        });
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

    var endPrompt = function () {
        this.prompt([{
            name: 'moduleName',
            message: 'Choose your NPM module name:',
            default: 'kevoree-' + this.rawEntityType + '-' + _.slugify(this.tdef.name),
            validate: function(answer) {
                var pattern = /[a-z0-9_-]+/;
                if (matcher(answer, pattern)) {
                    return true;
                } else {
                    return 'Allowed pattern for module name is ' + pattern.toString();
                }
            }
        }, {
            name: 'browserCompat',
            message: 'Do you want this to be runnable by the browser runtime?',
            type: 'confirm',
            default: false
        }, {
            name: 'license',
            message: 'What is the license of your module?',
            default: 'MIT'
        }, {
            name: 'author',
            message: 'Who is the author of your module?'
        }, {
            name: 'description',
            message: 'Give a description of your module'
        }], function(props) {
            this.moduleName = props.moduleName;
            this.browserCompat = props.browserCompat;
            this.browserUI = (this.rawEntityType === 'comp' && props.browserCompat);
            this.license = props.license;
            this.author = props.author;
            this.description = props.description;
            cb();
        }.bind(this));
    }.bind(this);

    var prompts = [{
        name: 'entityType',
        message: 'What kind of entity would you like to create?',
        type: 'list',
        choices: ENTITY_TYPES
    }, {
        name: 'entityName',
        message: 'Choose a name for this entity? (Java camel case naming convention)',
        validate: function(answer) {
            var pattern = /[A-Z][\w]*/;
            if (matcher(answer, pattern)) {
                return true;
            } else {
                return 'Allowed pattern for name is ' + pattern.toString();
            }
        }
    }, {
        name: 'kevoreePackage',
        message: 'Choose a package name for your module? (i.e my.package.name)',
        validate: function(answer) {
            var pattern = /[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*/g;
            if (matcher(answer, pattern)) {
                return true;
            } else {
                return 'Allowed pattern for package is ' + pattern.toString();
            }
        }
    }];

    this.prompt([{
        type: 'confirm',
        name: 'startFromExistingType',
        message: 'Would you like to start from an existing TypeDefinition from the Kevoree Registry?',
        default: false
    }], function(props) {
        var factory = new kevoree.factory.DefaultKevoreeFactory();
        this.tdef = factory.createTypeDefinition();

        if (props.startFromExistingType) {
            this.prompt([{
                name: 'fqn',
                message: 'Specify a TypeDefinition fully qualified name (eg. Ticker or my.company.MyType)',
                validate: function(answer) {
                    var pattern = /([a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*[.])?[A-Z]([a-zA-Z0-9_])*/g;
                    if (matcher(answer, pattern)) {
                        return true;
                    } else {
                        return 'Allowed pattern for fqn is ' + pattern.toString();
                    }
                }
            }], function(props) {
                var fqn = props.fqn;
                if (fqn.indexOf('.') === -1) {
                    fqn = 'org.kevoree.library.' + fqn;
                }
                kreg.get({
                    fqns: [fqn]
                }, function(err, modelStr) {
                    if (err) {
                        throw err;
                    } else {
                        var fact = new kevoree.factory.DefaultKevoreeFactory();
                        var model = fact.createJSONLoader().loadModelFromString(modelStr).get(0);
                        var versions = model.select(fqnToPath(fqn)).array
                            .map(function(tdef) {
                                return tdef.version;
                            }).sort(function (a, b) {
                                if      (semver.gt(a, b)) { return -1; }
                                else if (semver.lt(a, b)) { return 1; }
                                else                      { return 0;  }
                            });
                        this.prompt([{
                            name: 'version',
                            type: 'list',
                            message: 'Which version would you like to use? ('+versions.length+' total versions)',
                            choices: versions
                        }], function(props) {
                            var path = fqnToPath(fqn+'/'+props.version);
                            this.tdef = model.findByPath(path);
                            var pkg = fqn.split('.');
                            pkg.pop();
                            pkg = pkg.join('.');
                            this.rawEntityType = (function () {
                                switch (this.tdef.metaClassName()) {
                                    case 'org.kevoree.ComponentType':
                                        return 'comp';
                                    case 'org.kevoree.ChannelType':
                                        return 'chan';
                                    case 'org.kevoree.GroupType':
                                        return 'group';
                                    case 'org.kevoree.NodeType':
                                        return 'node';
                                }
                            }.bind(this))();
                            this.kevoreePackage = pkg;
                            this.fqn = fqn;
                            this.moduleVersion = this.tdef.version;

                            endPrompt();
                        }.bind(this));
                    }
                }.bind(this));
            }.bind(this));
        } else {
            this.prompt(prompts, function(props) {
                this.rawEntityType = ENTITY_TYPE_TAGS[props.entityType];
                this.kevoreePackage = props.kevoreePackage;
                this.tdef.name = props.entityName;
                if (this.kevoreePackage !== 'org.kevoree.library') {
                    this.fqn = this.kevoreePackage + '.' + props.entityName;
                }

                endPrompt();
            }.bind(this));
        }
    }.bind(this));
};

KevoreeGenerator.prototype.app = function app() {
    if (!this.tdef.version) {
        this.tdef.version = '1.0.0';
    }
    this.entityType = ENTITY_REAL_TYPES[this.rawEntityType];

    // common files & dirs for all entities
    this.template('_package.json', 'package.json');
    this.mkdir('lib');
    this.template('_README.md', 'README.md');
    this.copy('_.npmignore', '.npmignore');
    this.template('_.gitignore', '.gitignore');
    this.mkdir('kevs');

    if (this.browserCompat) {
        if (this.browserUI) {
            this.copy('browserGruntfileWithUI.js', 'Gruntfile.js');
            this.template('_ui.html', 'browser/' + this.moduleName + '.html');
            this.copy('ui-config.json', 'browser/ui-config.json');
            this.template('_' + this.rawEntityType + 'WithUIMain.kevs', 'kevs/main.kevs');
        } else {
            this.copy('browserGruntfile.js', 'Gruntfile.js');
            this.template('_' + this.rawEntityType + 'Main.kevs', 'kevs/main.kevs');
        }
    } else {
        this.copy('defaultGruntfile.js', 'Gruntfile.js');
        this.template('_' + this.rawEntityType + 'Main.kevs', 'kevs/main.kevs');
    }

    this.template('entities/_' + this.entityType + '.js', 'lib/' + this.tdef.name + '.js');
};
