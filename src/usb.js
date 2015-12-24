//import usbDetect from 'usb-detection';
import Promise from 'bluebird';
import udev from 'udev';
import njds from 'nodejs-disks';

var njdsDrives = Promise.promisify(njds.drives);
var njdsDrivesDetail = Promise.promisify(njds.drivesDetail);

class Usb {
  constructor() {
  }

  scan(callback) {
    njdsDrives()
      .then((drives) => {
        return njdsDrivesDetail(drives);
      })
      .map((drive) => {
        let corresponds = false;

        udev.list().forEach((dev) => {
          if (dev.hasOwnProperty('ID_USB_DRIVER') 
          && dev.ID_USB_DRIVER == 'usb-storage'
          && dev.DEVNAME == drive.drive) {
            drive.type = 'usb-storage';
            drive.name = dev.ID_FS_UUID;
            corresponds = true;
          }
          else if (dev.hasOwnProperty('ID_DRIVE_FLASH_SD')
          && dev.ID_DRIVE_FLASH_SD == '1'
          && dev.DEVNAME == drive.drive) {
            drive.type = 'sd-card';
            drive.name = dev.ID_NAME;
            corresponds = true;
          }
        });

        return (corresponds) ? drive : null;
      })
      .filter((drive) => drive)
      .then((drives) => {
        callback(null, drives);
      });
  }

  watch(callback) {
    let monitor = udev.monitor();

    monitor.on('add', function (device) {
      let devName = device.DEVNAME;
      let devId = device.ID_MODEL;
      let devModel = device.ID_FS_UUID || device.ID_NAME;

      setTimeout(function() {
        njdsDrives()
          .then((drives) => {
            return njdsDrivesDetail(drives);
          })
          .each((data) => {
            if (data.drive == devName)
              callback(null, 'add', { 
                id: devId,
                mountpoint: data.mountpoint, 
                name: devModel 
              });
          });

      }, 100);
    });

    monitor.on('remove', function (device) {
      console.log('monitor remove', device);

      let devId = device.ID_MODEL;

      callback(null, 'remove', { id: devId });
    });
  }
}

export default Usb;
