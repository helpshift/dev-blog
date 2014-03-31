// GruntFile.js
module.exports = function (grunt) {
  "use strict";

  // Config...
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    copy: {
      css : {
        src: 'css/**',
        dest: 'www/'
      }
    },

    shell: {
      jekyll: {
        command: 'rm -rf www/*; jekyll build',
        stdout: true
      }
    },

    watch: {
      options: {
        livereload: true
      },
      html: {
        files: ['**/*.html', '**/*.md', './_includes/*', './_layouts/*', '!www/**/*.html', './static/posts/*', 'atom.xml', 'rss.xml', 'sitemap.xml'],
        tasks: ['shell:jekyll']
      },
      css: {
        files: ['**/*.scss'],
        tasks: ['compassCopy', 'shell:jekyll']
      }
    },

    compass: {
      dev: {
        options: {
          config: './config.rb',
          sassDir: './scss',
          cssDir: './static/css',
          environment: 'development'
        }
      },
      prod: {
        options: {
          config: './config.rb',
          sassDir: './scss',
          cssDir: './static/css',
          environment: 'production',
          force: true
        }
      }
    },

    connect: {
      server: {
        options: {
          livereload: true,
          base: 'www/',
          port: 4000,
        }
      }
    },

  });

  // Load tasks...
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-shell');

  // Define a compass compile & copy task for livereload
  grunt.registerTask('compassCopy', ['compass:dev', 'copy:css']);
  grunt.registerTask('prod', ['compass:prod']);

  grunt.registerTask('server', [
    'connect:server',
    'watch'
  ]);

  // Default task.
  grunt.registerTask('default', 'server');
};
