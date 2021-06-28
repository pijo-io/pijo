#! /usr/bin/python3

import smbus
import time

try:
    addr=0x10 #ups i2c address
    bus=smbus.SMBus(1) #i2c-1
    time.sleep(1) #wait here to avoid 121 IO Error
    vcellH=bus.read_byte_data(addr,0x03)
    vcellL=bus.read_byte_data(addr,0x04)
    socH=bus.read_byte_data(addr,0x05)
    socL=bus.read_byte_data(addr,0x06)

    capacity=(((vcellH&0x0F)<<8)+vcellL)*1.25 #capacity
    charge=((socH<<8)+socL)*0.003906 #current electric quantity as percentage

    print("{\n  \"capacity_mV\": %d,\n  \"charged\": %.2f\n}"%(capacity, charge))
    exit( int(charge) )
except OSError:
    print("{\n  \"error\": true }")
    exit -1


