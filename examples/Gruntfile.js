var arduino = process.env.ARDUINO_PATH;

var boards = {
    "uno" :{
        package: "arduino:avr:uno",
    },
    "nano": {
        cpu: "atmega328",
        package: "arduino:avr:nano:cpu=atmega328",
    },
    "pro-mini": {
        cpu: "16MHzatmega328",
        package: "arduino:avr:pro:cpu=16MHzatmega328",
    },
};

var boardlist = Object.keys(boards).toString();

module.exports = function(grunt) {

    // configure the tasks
    grunt.initConfig({
        // exec: create task dynamically see end of file for where this happens.
        // This is used to create the target exec instructions for automatically
        // compiling the firmware into hex files.

        copy: {
            // copies the source files into a single build directory.
            // note the second src directive goes back out to the rest of this
            // repo to get the files. Normally these would all be in one src
            // hierarchy
            options: {
                timestamp: true,
            },
            backpack: {
                cwd: 'firmware',
                flatten: true,
                src: [ 'src/*', '../../src/*' ],
                dest: 'firmware/build/testBackpack/',
                expand: true,
                filter: 'isFile',
            },
        },
        clean: {
            // cleans the folders of all irrelevant files.
            firmware_build: {
                // Removes the build files.
                src: [
                        'firmware/build/testBackpack',
                     ]
            },
            compiled_bins: {
                // removes the compiled binaries
                src: [
                        'firmware/bin/backpack/*',
                    ]
            },
            post_compile: {
                // removes the intermediate files for as we only need the
                // hex files remaining.
                src: [
                        'firmware/bin/backpack/{' + boardlist + '}/!(*ino.hex)',
                    ]
            },
        },
    });

    // load the tasks
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-exec');

    // dynamically create the compile targets for the various boards
    Object.keys(boards).forEach(function(key) {
        grunt.config(["exec", "backpack_" + key], {
            command:function() {
                return arduino + " --verify --verbose-build --board "  + boards[key].package +
                " --pref build.path=firmware/bin/backpack/" + key +  " firmware/build/testBackpack/testBackpack.ino";
            },
        });
    });

    grunt.registerTask('build', ['clean:firmware_build', 'clean:compiled_bins', 'copy']);
    grunt.registerTask('compile', ['build', 'exec', 'clean:post_compile']);
};
