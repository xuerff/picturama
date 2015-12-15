//import usbDetect from 'usb-detection';
import Promise from 'bluebird';
import udev from 'udev';
import njds from 'nodejs-disks';

var njdsDrives = Promise.promisify(njds.drives);
var njdsDrivesDetail = Promise.promisify(njds.drivesDetail);

class Usb {
  constructor(callback) {
    let monitor = udev.monitor();

    monitor.on('add', function (device) {
      //console.log('add device', device);

      let devName = device.DEVNAME;
      let devModel = device.ID_MODEL || device.ID_NAME;

      setTimeout(function() {
        njdsDrives()
          //.then((drives) => njds.drivesDetail(drives))
          .then((drives) => {
            //console.log('drives', drives);
            return njdsDrivesDetail(drives);
          })
          .each((data) => {
            //console.log('drive', data);

            if (data.drive == devName)
              callback(null, { mountpoint: data.mountpoint, name: devModel });
          });

      }, 100);
      //njds.drives(function (err, drives) {
      //  njds.drivesDetail(drives, function (err, data) {
      //    data.forEach(function(drive) {
      //      if (data.drive == devName)
      //        callback(null, { mountpoint: drive.mountpoint, name: devModel });
      //    });
      //  });
      //});
    });

    //usbDetect.on('add', function(device) {
    //  console.log('usb detect add');
    //  var devicePath = '/dev/disk/by-id/usb-' + device.manufacturer + '_' + device.deviceName +
    //                   '_' + device.serialNumber + '-' + device.deviceAddress +
    //                   ':' + device.locationId + '-part1';

    //  setTimeout(function() {
    //    let devPoint = fs.readlinkSync(devicePath);
    //    let driveName = devPoint.match(/[a-z]{3}\d{1}/i)[0];

    //    njds.drives(function (err, drives) {
    //      console.log('list drives');
    //      njds.drivesDetail(drives, function (err, data) {
    //        data.forEach(function(drive) {
    //          if (drive.drive.match(/[a-z]{3}\d{1}$/i)) {
    //            let targetDriveName = drive.drive.match(/[a-z]{3}\d{1}$/i)[0];

    //            if (targetDriveName == driveName)
    //              callback(null, { mountpoint: drive.mountpoint, name: device.deviceName });
    //          }
    //        });
    //      });
    //    });
    //  }, 2000);
    //});
  }
}

export default Usb;
