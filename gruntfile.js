module.exports = function(grunt){
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jsbeautifier: {
      files: ["views/html/*.html", "public/javascripts/visualization.js", "public/stylesheets/*.css"],
      options: {
        html: {
          braceStyle: "collapse",
          indentChar: " ",
          indentScripts: "keep",
          indentSize: 2,
          maxPreserveNewlines: 10,
          preserveNewlines: true,
          unformatted: ["a", "sub", "sup", "b", "i", "u"],
          wrapLineLength: 0
        },
        css: {
          indentChar: " ",
          indentSize: 2
        },
        js: {
              braceStyle: "collapse",
              breakChainedMethods: false,
              e4x: false,
              evalCode: false,
              indentChar: " ",
              indentLevel: 0,
              indentSize: 2,
              indentWithTabs: false,
              jslintHappy: false,
              keepArrayIndentation: false,
              keepFunctionIndentation: false,
              maxPreserveNewlines: 1000,
              preserveNewlines: true,
              spaceBeforeConditional: true,
              spaceInParen: false,
              unescapeStrings: false,
              wrapLineLength: 0
          }
      }
    },
    uglify: {
      my_target: {
        files: {
          'public/javascripts/minified/dashboard.min.js' : ['public/javascripts/dashboard.js'],
          'public/javascripts/minified/map.min.js' : ['public/javascripts/map.js'],
          'public/javascripts/minified/sidebutton.min.js' : ['public/javascripts/sidebutton.js'],
          'public/javascripts/minified/barchart.min.js' : ['public/javascripts/barchart.js'],
          'public/javascripts/minified/sidepanel.min.js' : ['public/javascripts/sidepanel.js']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['jsbeautifier', 'uglify']);
}