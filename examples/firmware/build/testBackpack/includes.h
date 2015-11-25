#include <Wire.h>

#define DEFAULT_I2C_SENSOR_ADDRESS  0x61
#define REGISTER_MAP_SIZE 4

#define FIRMWARE_VERSION "0.1.1"

#ifndef _DEBUG
    #define _DEBUG true
#endif

#ifndef _VDEBUG
    // verbose debug
    #define _VDEBUG true
#endif
