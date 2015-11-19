# interchange-arduino

This repository contains the latest source files for the interchange library
for arduino usage.

See http://github.com/ajfisher/nodebots-interchange for more information about
Interchange generally.

This library provides a drop in interface for nodebots I2C backpacks including
EEPROM manipulation and interchange for the interchange configuration client to
connect to.

A production example of this library in action is available at
https://github.com/ajfisher/nodebots-hcsr04

A demo example is also provided in the `examples` directory that includes helper
grunt configuration to show how the build process can work for your application.

## Installation.

The best way to use this library it to use it as a submodule in your own repo
and then include it into your build process using Grunt (or make or other).

This means your version of interchange can be kept up to date and as it's simply
source files you can get the benefit of any improvements.

Typically this might look like this (assuming `great-backpack` is a git repo already).

```
cd great-backpack
```

A backpack repo should have a `firmware` folder that contains three folders, detailed
below:

* `bin`: the binary hex files produced by your compilation process that will be
put on the arduino
* `build`: the built files with any modifications, composition etc that is needed
* `src`: your source files that will be used to build your backpack

Within `src` you would usually have two sub folders, `controller` which contains
your code for your controller that you're going to build and then `libs` which
contain any third party libraries such as Interchange (or firmata or node-pixel etc).

We'll assume you have this structure so your submodule is put in the right place.

```
git submodule add https://github.com/ajfisher/interchange-arduino.git firmware/src/libs/interchange-arduino
```

This will now add a folder called `interchange-arduino` to your `src/libs`
folder which you can now use in your build process.

## Usage

You will need to include the `interchange-arduino/src` files into your project
and bring them in as part of your build steps. In this case we'll use grunt
to demonstrate this process.

Assuming you have a file called `backpack.ino` at `src/controller` the first thing
to do is make a build pipeline that copies your files from the controller and
libs directories to a build directory to compile from.

In grunt include a task such as that given below:

```
    grunt.initConfig({
        // exec: create task dynamically see end of file for where this happens.
        copy: {
            options: {
                timestamp: true,
            },

            backpack: {
                cwd: 'firmware/src/',
                flatten: true,
                src: [ 'controller/*', 'libs/interchange-arduino/*'  ],
                dest: 'firmware/build/backpack/',
                expand: true,
                filter: 'isFile',
            },
        },
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
```

You can now run:

```
grunt copy
```

And your files will be copied from the appropriate sources to a single destination.
Generally you should set a `clean` task as well that cleans out that destination
folder so you ensure you aren't getting any dodgy old files and it's rebuilt
properly each time.

From there you should now be able to compile your `.ino` file from the Arduino
IDE and it should compile properly.

To make the Interchange library available you should include it into your
`src/controller/backpack.ino` file. Somewhere near the top of the file add the
following:

```c
#include "interchange.h"
```

This will bring the library in with all of it's capabilties.

To use the library add something like the following `setup()` function to your
backpack sketch.

```
void setup() {

    // check to see if we're in config mode
    config_check();

    if (state == CONFIG) {
        Serial.begin(9600);
        run_config(Serial, FIRMWARE_VERSION);

    } else if (state == RUNNING) {
        uint8_t i2c_address;

        if (use_custom_address() ) {
            if (get_i2c_address() > 0) {
                i2c_address = get_i2c_address();
            } else {
                i2c_address = DEFAULT_I2C_SENSOR_ADDRESS;
            }
        } else {
            i2c_address = DEFAULT_I2C_SENSOR_ADDRESS;
        }

        Wire.begin(i2c_address);
        Wire.onRequest(requestData);
    }
}
```

Breaking this down, Interchange provides a state machine that determines if it
is in config or running mode. Config mode is usually entered by pulling PIN 2
HIGH during the boot stage. You can modify this by setting:

```
#define CONFIG_PIN 2
```

AFTER the interchange.h include has been made (this will redefine the pin).

You should also provide a `FIRMWARE_VERSION` as a #define to provide the version
of your firmware so it can be provided to the user properly.

If you aren't in config mode 
