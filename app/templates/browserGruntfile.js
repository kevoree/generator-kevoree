module.exports = function (grunt) {

    grunt.initConfig({
        // retrieve your project package.json
        pkg: grunt.file.readJSON('package.json'),

        // creates kevlib.json which represents your project Kevoree model
        // by parsing your pkg.main entry point
        kevoree_genmodel: {
            main: {
                options: {
                    quiet: false,
                    verbose: true
                }
            }
        },

        kevoree_registry: {
            src: 'kevlib.json'
        },

        browserify: {
            browser: {
                options: {
                    alias: [ '<%= pkg.main %>:<%= pkg.name %>' ]
                },
                src: [],
                dest: 'browser/<%= pkg.name %>.js'
            }
        },

        uglify: {
            options: {
                mangle: {
                    except: ['_super']
                }
            },
            browser: {
                src: '<%= browserify.browser.dest %>',
                dest: 'browser/<%= pkg.name %>.min.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-kevoree');
    grunt.loadNpmTasks('grunt-kevoree-genmodel');
    grunt.loadNpmTasks('grunt-kevoree-registry');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', 'build:dev');
    grunt.registerTask('build', 'Build Kevoree module', function () {
        if (process.env.KEVOREE_RUNTIME !== 'dev') {
            grunt.tasks([
                'kevoree_genmodel',
                'uglify',
                'browser'
            ]);
        }
    });
    grunt.registerTask('build:dev', 'Build Kevoree module', function () {
        if (process.env.KEVOREE_RUNTIME !== 'dev') {
            grunt.tasks([
                'kevoree_genmodel',
                'browser:dev'
            ]);
        }
    });
    grunt.registerTask('publish', 'kevoree_registry');
    grunt.registerTask('kev', ['build:dev', 'kevoree']);
    grunt.registerTask('browser', ['browserify', 'uglify']);
    grunt.registerTask('browser:dev', 'browserify');
};
