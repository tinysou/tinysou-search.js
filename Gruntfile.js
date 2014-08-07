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
      all: {
        src: ['src/jquery.tinysou.js', 'deps/hogan-3.0.1.js', 'deps/jquery-2.1.1.js', 'deps/jquery.hashchange.js', 'deps/jquery.modal.js'],
        dest: 'build/tinysou-all.js'
      },
      nojquery: {
        src: ['src/jquery.tinysou.js', 'deps/hogan-3.0.1.js', 'deps/jquery.hashchange.js', 'deps/jquery.modal.js'],
        dest: 'build/tinysou-nojquery.js'
      },
      bare: {
        src: 'src/jquery.tinysou.js',
        dest: 'build/jquery.tinysou.min.js'
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
