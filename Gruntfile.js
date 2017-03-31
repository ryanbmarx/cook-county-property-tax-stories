module.exports = function(grunt) {
  var config = {};

  // Put your JavaScript library dependencies here. e.g. jQuery, underscore,
  // etc.
  // You'll also have to install them using a command similar to:
  //     npm install --save jquery
  var VENDOR_LIBRARIES = [
    'jquery',
    // 'pym.js',
    'in-view',
    'd3',
    'd3-pre',
    'd3-queue'
  ];

  config.browserify = {
    options: {
      browserifyOptions: {
        debug: true,
        paths:['js/src/', 'node_modules/bootstrap-sass/assets/javascripts']
      },

    },
    app: {
      src: ['js/src/app.js'],
      dest: 'js/app.min.js',
      options: {
        plugin: [
          [
            'minifyify', {
              map: 'app.min.js.map',
              output: './js/app.min.js.map'
            }
          ]
        ],
        transform: [
          [
            'babelify', {
              presets: ['es2015']
            }
          ]
        ]
      }
    },
    day1header: {
      src: ['js/src/day1header.js'],
      dest: 'js/day1header.min.js',
      options: {
        plugin: [
          [
            'minifyify', {
              map: 'day1header.min.js.map',
              output: './js/day1header.min.js.map'
            }
          ]
        ],
        transform: [
          [
            'babelify', {
              presets: ['es2015']
            }
          ]
        ]
      }
    }
  };

  // Check if there are vendor libraries and build a vendor bundle if needed
  if (VENDOR_LIBRARIES.length) {
    config.browserify.app.options = config.browserify.app.options || {};
    config.browserify.app.options.exclude = VENDOR_LIBRARIES;

    config.browserify.vendor = {
      src: [],
      dest: 'js/vendor.min.js',
      options: {
        plugin: [
          [
            'minifyify', {
              map: 'vendor.min.js.map',
              output: './js/vendor.min.js.map'
            }
          ]
        ],
        require: VENDOR_LIBRARIES
      }
    };
  }

  config.sass = {
    options: {
      outputStyle: 'compressed',
      sourceMap: true,
      includePaths: [ 'sass/', 'node_modules/trib-styles/sass/', 'node_modules/bootstrap-sass/assets/stylesheets/' ]
    },
    app: {
      files: {
        'css/styles.css': 'sass/styles.scss'
      }
    }
  };

  config.watch = {
    sass: {
      files: ['sass/**/*.scss'],
      tasks: ['sass', 'postcss']
    },
    js: {
      files: ['js/src/**/*.js'],
      tasks: ['browserify:day1header', 'browserify:app']
    }
  };

  config.postcss = {
    options:{
      map:{
        inline:false,
        annotation:'css'
      },
      processors:[
        require('autoprefixer')({
          browsers: [
            "Android 2.3",
            "Android >= 4",
            "Chrome >= 20",
            "Firefox >= 24",
            "Explorer >= 8",
            "iOS >= 6",
            "Opera >= 12",
            "Safari >= 6"
          ]
        })
      ]
    },
    dist: {
      src: 'css/**/*.css'
    }
  }

  grunt.initConfig(config);

  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-postcss');

  var defaultTasks = [];

  defaultTasks.push('sass');
  defaultTasks.push('browserify');
  defaultTasks.push('postcss');

  grunt.registerTask('default', defaultTasks);
};