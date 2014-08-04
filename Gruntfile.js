module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['src/jquery-2.1.1.js', 'src/jquery.modal.js', 'src/hogan-3.0.1.js',
        'src/jquery.hashchange.js', 'src/tinysou.js'],
        dest: 'build/tinysou.js'
      }
    },
    uglify: {
      build: {
        src: 'build/tinysou.js',
        dest: 'build/tinysou.min.js'
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
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-css');
  // Default task(s).
  grunt.registerTask('default', ['concat', 'uglify', 'cssmin']);
};
