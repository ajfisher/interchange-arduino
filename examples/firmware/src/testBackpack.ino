#include "interchange.h"

#define FIRMWARE_VERSION "0.1.0"
#define DEFAULT_I2C_SENSOR_ADDRESS 0x61

byte register_map[REGISTER_MAP_SIZE];

void setup() {

    // does the configuration check to determine if we're in config mode
    // or not. This is defaulted to pulling D2 HIGH.
    config_check();

    if (state == CONFIG) {
        Serial.begin(9600);
        run_config(Serial, FIRMWARE_VERSION);

    } else if (state == RUNNING) {
        uint8_t i2c_address;

        // look up whether we need to use a custom address (eg it's been
        // set by the interchange client in EEPROM or not. If not use the
        // default that has been defined above.
        if (use_custom_address() ) {
            if (get_i2c_address() > 0) {
                i2c_address = get_i2c_address();
            } else {
                i2c_address = DEFAULT_I2C_SENSOR_ADDRESS;
            }
        } else {
            i2c_address = DEFAULT_I2C_SENSOR_ADDRESS;
        }

        // fire up the I2C wire protocol and register a callback.
        Wire.begin(i2c_address);
        Wire.onRequest(requestData);
    }

#if _DEBUG
    if (state != CONFIG) {
        Serial.begin(9600);
    }

    // handy debug output to just make sure you're getting what you set properly.
    Serial.println(F("Test Backpack firmware - DEBUG MODE"));
    Serial.print(F("Use custom: "));
    Serial.println(use_custom_address());
    Serial.print(F("I2C address: "));
    Serial.println(get_i2c_address());
#endif
}

void loop() {

    // main loop is a very simple state machine check to see if we're RUNNING
    // or in CONFIG mode. If in config we hand off to the interchange lib to
    // manage this. If not then we can hand over to a function to do some work
    // in this case we call out to generate_couter()
    if (state == RUNNING) {
        generate_counter();
        delay(1);
    } else if (state == CONFIG) {
        interchange_commands();
    }
}

void generate_counter() {
    // simply increments a counter periodically that can be sent back to an
    // I2C request.
}


void requestData() {

    // when we get a request for data we simply pass the two bytes of the duration
    // into the register map and then we write that back out on the wire.
    register_map[0] = duration >> 8;    //MSB
    register_map[1] = duration & 0xFF;  //LSB

    // write out via I2C using the buffer
    Wire.write(register_map, REGISTER_MAP_SIZE);

#if _DEBUG
    Serial.print("rm: ");
    Serial.print(register_map[0]);
    Serial.print(" ");
    Serial.print(register_map[1]);
    Serial.println();
#endif
}
