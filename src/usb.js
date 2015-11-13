import usbDetect from 'usb-detection';
import fs from 'fs';
import njds from 'nodejs-disks';

class Usb {
  constructor(callback) {
    usbDetect.on('add', function(device) {
      var devicePath = '/dev/disk/by-id/usb-' + device.manufacturer + '_' + device.deviceName +
                       '_' + device.serialNumber + '-' + device.deviceAddress +
                       ':' + device.locationId + '-part1';

      setTimeout(function() {
        let devPoint = fs.readlinkSync(devicePath);
        let driveName = devPoint.match(/[a-z]{3}\d{1}/i)[0];

        njds.drives(function (err, drives) {
          njds.drivesDetail(drives, function (err, data) {
            data.forEach(function(drive) {
              if (drive.drive.match(/[a-z]{3}\d{1}$/i)) {
                let targetDriveName = drive.drive.match(/[a-z]{3}\d{1}$/i)[0];

                if (targetDriveName == driveName)
                  callback(null, { mountpoint: drive.mountpoint, name: device.deviceName });
              }
            });
          });
        });
      }, 2000);
    });
  }
}

export default Usb;
