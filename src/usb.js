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
    //udev.list().forEach((dev) => {
    //  if (dev.DEVNAME == '/dev/mmcblk0p1' || dev.DEVNAME == '/dev/sdb1')
    //    console.log('dev name', dev);
    //});

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
      let devModel = device.ID_MODEL || device.ID_NAME;

      setTimeout(function() {
        njdsDrives()
          .then((drives) => {
            return njdsDrivesDetail(drives);
          })
          .each((data) => {
            if (data.drive == devName)
              callback(null, { mountpoint: data.mountpoint, name: devModel });
          });

      }, 100);
    });
  }
}

export default Usb;
