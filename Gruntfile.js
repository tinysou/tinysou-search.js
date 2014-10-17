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
        src: ['deps/jquery.js', 'deps/jquery.modal.js', 'src/jquery.tinysou.js'],
        dest: 'build/jquery.tinysou.js'
      },
      nojquery: {
        src: ['deps/jquery.modal.js', 'src/jquery.tinysou.js'],
        dest: 'build/nojquery.tinysou.js'
      },
      zepto: {
        src: ['deps/zepto.js', 'deps/zepto.data.js', 'deps/zepto.modal.js', 'src/zepto.tinysou.js'],
        dest: 'build/zepto.tinysou.js'
      },
      nozepto: {
        src: ['deps/zepto.data.js', 'deps/zepto.modal.js', 'src/zepto.tinysou.js'],
        dest: 'build/nozepto.tinysou.js'
      }
    },
    cssmin: {
      css: {
        src: 'src/tinysou.css',
        dest:'build/tinysou.min.css'
      }
    }
  });
  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-css');
  // Default task(s).
  grunt.registerTask('default', ['uglify', 'cssmin']);
};
