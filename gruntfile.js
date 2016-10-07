module.exports = function (grunt) {
    grunt.initConfig({
        pkgFile: 'package.json',
        clean: ['build'],
        babel: {
            options: {
                sourceMap: false
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: './lib',
                    src: ['**/*.js'],
                    dest: 'build',
                    ext: '.js'
                }]
            }
        },
        flow: {
            src: 'lib/**/*.js',
            options: {
                server: true
            }
        },
        watch: {
            flow: {
                files: ['lib/**/*.js'],
                tasks: ['flow']
            },
            dist: {
                files: ['./lib/**/*.js'],
                tasks: ['babel:dist']
            }
        },
        eslint: {
            target: [
                'index.js',
                'launcher.js',
                'lib/**/*.js'
            ]
        },
        contributors: {
            options: {
                commitMessage: 'update contributors'
            }
        },
        bump: {
            options: {
                commitMessage: 'v%VERSION%',
                pushTo: 'upstream'
            }
        }
    });

    require('load-grunt-tasks')(grunt);
    grunt.registerTask('default', ['build']);
    grunt.registerTask('build', 'Build wdio-appium-service', function () {
        grunt.task.run([
            'clean',
            'flow',
            'babel'
        ]);
    });
    grunt.registerTask('release', 'Bump and tag version', function (type) {
        grunt.task.run([
            'eslint',
            'build',
            'contributors',
            'bump:' + (type || 'patch')
        ]);
    });
};
