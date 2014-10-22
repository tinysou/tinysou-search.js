module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        compress: {
          drop_console: true
        }
      },
      jquery: {
        src: ['node_modules/jquery/dist/jquery.min.js', 'deps/jquery.modal.js', 'src/jquery.tinysou.js'],
        dest: 'build/jquery.tinysou.js'
      },
      nojquery: {
        src: ['deps/jquery.modal.js', 'src/jquery.tinysou.js'],
        dest: 'build/nojquery.tinysou.js'
      },
      zepto: {
        src: ['node_modules/zepto/src/zepto.js', 'node_modules/zepto/src/ajax.js', 'node_modules/zepto/src/event.js', 'node_modules/zepto/src/form.js', 'node_modules/zepto/src/data.js', 'deps/zepto.modal.js', 'src/zepto.tinysou.js'],
        dest: 'build/zepto.tinysou.js'
      },
      nozepto: {
        src: ['node_modules/zepto/src/data.js', 'deps/zepto.modal.js', 'src/zepto.tinysou.js'],
        dest: 'build/nozepto.tinysou.js'
      }
    },
    watch: {
      js: {
        files: ['deps/*.js', 'src/*.js'],
        tasks: ['uglify']
      },
      css: {
        files: ['src/*.scss'],
        tasks: ['cssmin']
      }
    },
    cssmin: {
      css: {
        src: 'src/tinysou.css',
        dest:'build/tinysou.css'
      }
    }
  });
  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-css');
  grunt.loadNpmTasks('grunt-contrib-watch');
  // Default task(s).
  grunt.registerTask('default', ['watch']);
};
