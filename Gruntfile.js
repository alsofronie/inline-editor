'use strict';

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
                ' * <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                ' * <%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
                ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
                ' * Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>' + 
                ' */' +
                ' \n',
        // Task configuration.
        clean: {
            files: ['dist']
        },
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            dist: {
                src: ['src/jquery.<%= pkg.name %>.js'],
                dest: 'dist/jquery.<%= pkg.name %>.js'
            },
            nojquery: {
                src: ['src/js/*.js'],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            dist: {
                src: '<%= concat.dist.dest %>',
                dest: 'dist/jquery.<%= pkg.name %>.min.js'
            },
            nojquery: {
                src: '<%= concat.nojquery.dest %>',
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        },
        qunit: {
            files: ['test/**/*.html']
        },
        jshint: {
            options: {
                jshintrc: true
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            src: {
                src: ['src/**/*.js']
            },
            test: {
                src: ['test/**/*.js']
            },
        },
        less: {
            production: {
                options: {
                    compress: true,
                    optimization: 2,
                    banner: '<%= banner %>\n'
                },
                files: [{
                        cwd: 'src/less',
                        expand:true,
                        src: [ '*.less'],
                        dest: 'dist/css',
                        ext: '.min.css'
                }],
            },
            developement: {
                options: {
                    compress: false,
                    banner: '<%= banner %>\n'
                },
                files: [{
                        cwd: 'src/less',
                        expand:true,
                        src: [ '*.less'],
                        dest: 'dist/css',
                        ext: '.css'
                }],
            } 
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            src: {
                files: '<%= jshint.src.src %>',
                tasks: ['jshint:src', /*'qunit', */'concat','uglify']
            },
            /*
            test: {
                files: '<%= jshint.test.src %>',
                tasks: ['jshint:test']
            },
            */
            styles: {
                files: 'src/less/*.less',
                tasks: ['less']
            }
        },
        serve: {
            options: {
                port:9000
            },
            path: "demo/"
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-serve');

    // Default task.
    grunt.registerTask('default', ['jshint', /*'qunit',*/ 'clean', 'concat', 'uglify', 'less']);

};
