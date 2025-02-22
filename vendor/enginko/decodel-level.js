'use strict';

function decodeUplink(payload) {
  payload = TTNfrom(payload);
  var uplinkId = payload.substring(0, 2);
  var content;

  switch (uplinkId.toUpperCase()) {
    case '01':
      content = parseTimeSync(payload.trim());
      break;

    case '14':
      content = parseLevel(payload.trim());
      break;

    default:
      content = null;
      break;
  }
  return TTNto(content);
}

function TTNfrom(TTNpayload) {
  var obj;

  if (typeof TTNpayload === 'string') {
    obj = JSON.parse(TTNpayload);
  } else {
    obj = JSON.parse(JSON.stringify(TTNpayload));
  }

  var fPort = obj.fPort;
  var payload = '';

  for (var i = 0; i < obj.bytes.length; i++) {
    payload += parseInt(obj.bytes[i], 10).toString(16).padStart(2, '0');
  }

  return payload;
}

function TTNto(content) {
  var TTNcontent = {};

  if (content !== null) {
    for (var i = 0; i < content.length; i++) {
      TTNcontent[content[i].variable] = content[i].value;
    }

    return {
      data: TTNcontent,
    };
  } else {
    return {
      data: content,
      warnings: [],
      errors: ['Error on decoding payload'],
    };
  }
}
function parseLevel(payload) {
  var r = [];

  var payloadToByteArray = hexStringToByteArray(payload);
  var typeNumber = ((0x00 << 8) & 0xff00) | (payloadToByteArray[1] & 0xff);
  const type = {
    variable: 'type',
    value: typeNumber,
  };
  r.push(type);

  var date, ADC, distance1, battery, error;

  var startData = 2;
  switch (typeNumber) {
    case 0x00:
      startData = 6;
      date = {
        variable: 'date',
        value: parseDateByte(payloadToByteArray.slice(2, startData)),
      };
      r.push(date);

      ADC = {
        variable: 'ADC',
        value: Number(((payloadToByteArray[startData + 1] << 8) & 0xff00) | (payloadToByteArray[startData] & 0xff)).toFixed(),
        unit: 'mV',
      };
      r.push(ADC);
      startData += 2;
      startData += 2;

      if (startData + 2 <= payloadToByteArray.length) {
        var distanceNumber = Number(((payloadToByteArray[startData + 1] << 8) & 0xff00) | (payloadToByteArray[startData] & 0xff)).toFixed();
        if (distanceNumber <= 60000) {
          distance1 = {
            variable: 'distance1',
            value: distanceNumber,
            unit: 'mm',
          };
          r.push(distance1);
        } else {
          error = {
            variable: 'distance1',
            value: 'distance error [' + distanceNumber + ']',
          };
          r.push(error);
        }
      }
      startData += 2;

      if (startData + 1 === payloadToByteArray.length) {
        battery = {
          variable: 'battery',
          value: Number(parseInt(payloadToByteArray[startData])).toFixed(),
          unit: '%',
        };
        r.push(battery);
      }

      return r;
    case 0x01:
      startData = 6;
      date = {
        variable: 'date',
        value: parseDateByte(payloadToByteArray.slice(2, startData)),
      };
      r.push(date);

      ADC = {
        variable: 'ADC',
        value: Number(((payloadToByteArray[startData + 1] << 8) & 0xff00) | (payloadToByteArray[startData] & 0xff)).toFixed(),
        unit: 'mV',
      };
      r.push(ADC);
      startData += 2;
      startData += 2;

      if (startData + 2 <= payloadToByteArray.length) {
        var distanceNumber = Number(((payloadToByteArray[startData + 1] << 8) & 0xff00) | (payloadToByteArray[startData] & 0xff)).toFixed();
        if (distanceNumber <= 60000) {
          distance1 = {
            variable: 'distance1',
            value: distanceNumber,
            unit: 'mm',
          };
          r.push(distance1);
        } else {
          error = {
            variable: 'distance1',
            value: 'distance error [' + distanceNumber + ']',
          };
          r.push(error);
        }
      }
      startData += 2;

      var fillLevel = {
        variable: 'fillLevel',
        value: Number(parseInt(payloadToByteArray[startData])).toFixed(),
        unit: '%',
      };
      r.push(fillLevel);
      startData += 1;

      var temperature = {
        variable: 'temperature',
        value: getTemperature(payloadToByteArray[startData], payloadToByteArray[startData + 1]),
        unit: '� C',
      };
      r.push(temperature);
      startData += 2;

      if (startData + 1 === payloadToByteArray.length) {
        battery = {
          variable: 'battery',
          value: Number(parseInt(payloadToByteArray[startData])).toFixed(),
          unit: '%',
        };
        r.push(battery);
      }

      return r;
    case 0x02:
      startData = 6;
      date = {
        variable: 'date',
        value: parseDateByte(payloadToByteArray.slice(2, startData)),
      };
      r.push(date);

      ADC = {
        variable: 'ADC',
        value: Number(((payloadToByteArray[startData + 1] << 8) & 0xff00) | (payloadToByteArray[startData] & 0xff)).toFixed(),
        unit: 'mV',
      };
      r.push(ADC);
      startData += 2;
      startData += 2;

      if (startData + 2 <= payloadToByteArray.length) {
        var distanceNumber = Number(((payloadToByteArray[startData + 1] << 8) & 0xff00) | (payloadToByteArray[startData] & 0xff)).toFixed();
        if (distanceNumber <= 60000) {
          distance1 = {
            variable: 'distance1',
            value: distanceNumber,
            unit: 'mm',
          };
          r.push(distance1);
        } else {
          error = {
            variable: 'distance1',
            value: 'distance error [' + distanceNumber + ']',
          };
          r.push(error);
        }
      }
      startData += 2;

      var temperature = {
        variable: 'temperature',
        value: getTemperature(payloadToByteArray[startData], payloadToByteArray[startData + 1]),
        unit: '� C',
      };
      r.push(temperature);
      startData += 2;

      var humidity = {
        variable: 'humidity',
        value: getHumidity(parseInt(payloadToByteArray[startData])),
        unit: '%',
      };
      r.push(humidity);
      startData += 1;

      var pressure = {
        variable: 'pressure',
        value: getPressure(payloadToByteArray[startData], payloadToByteArray[startData + 1], payloadToByteArray[startData + 2]),
        unit: 'hPa',
      };
      r.push(pressure);
      startData += 3;

      if (startData + 1 === payloadToByteArray.length) {
        battery = {
          variable: 'battery',
          value: Number(parseInt(payloadToByteArray[startData])).toFixed(),
          unit: '%',
        };
        r.push(battery);
      }

      return r;
    case 0x03:
      startData = 6;
      date = {
        variable: 'date',
        value: parseDateByte(payloadToByteArray.slice(2, startData)),
      };
      r.push(date);

      ADC = {
        variable: 'ADC',
        value: Number(((payloadToByteArray[startData + 1] << 8) & 0xff00) | (payloadToByteArray[startData] & 0xff)).toFixed(),
        unit: 'mV',
      };
      r.push(ADC);
      startData += 2;
      startData += 2;

      if (startData + 2 <= payloadToByteArray.length) {
        var distanceNumber = Number(((payloadToByteArray[startData + 1] << 8) & 0xff00) | (payloadToByteArray[startData] & 0xff)).toFixed();
        if (distanceNumber <= 60000) {
          distance1 = {
            variable: 'distance1',
            value: distanceNumber,
            unit: 'mm',
          };
          r.push(distance1);
        } else {
          error = {
            variable: 'distance1',
            value: 'distance error [' + distanceNumber + ']',
          };
          r.push(error);
        }
      }
      startData += 2;

      var fillLevel = {
        variable: 'fillLevel',
        value: Number(parseInt(payloadToByteArray[startData])).toFixed(),
        unit: '%',
      };
      r.push(fillLevel);
      startData += 1;

      var temperature = {
        variable: 'temperature',
        value: getTemperature(payloadToByteArray[startData], payloadToByteArray[startData + 1]),
        unit: '� C',
      };
      r.push(temperature);
      startData += 2;

      var humidity = {
        variable: 'humidity',
        value: getHumidity(parseInt(payloadToByteArray[startData])),
        unit: '%',
      };
      r.push(humidity);
      startData += 1;

      var pressure = {
        variable: 'pressure',
        value: getPressure(payloadToByteArray[startData], payloadToByteArray[startData + 1], payloadToByteArray[startData + 2]),
        unit: 'hPa',
      };
      r.push(pressure);
      startData += 3;

      if (startData + 1 === payloadToByteArray.length) {
        battery = {
          variable: 'battery',
          value: Number(parseInt(payloadToByteArray[startData])).toFixed(),
          unit: '%',
        };
        r.push(battery);
      }

      return r;
    default:
      return null;
  }
}

function getTemperature(lo, hi) {
  var temperature = String((((lo & 0xff) + ((hi << 8) & 0xff00)) << 16) >> 16).padStart(3);
  temperature = temperature.substring(0, temperature.length - 2) + '.' + temperature.substring(temperature.length - 2);
  return Number(temperature).toFixed(2);
}

function getHumidity(lo) {
  var humidity = (((((0 & 0xff) << 8) | (lo & 0xff)) << 16) >> 16) / 2;
  return Number(humidity).toFixed(2);
}

function parseDate(payload) {
  var date = new Date();
  var binary = Number(parseInt(reverseBytes(payload), 16))
    .toString(2)
    .padStart(32, '0');
  var year = parseInt(binary.substring(0, 7), 2) + 2000;
  var month = parseInt(binary.substring(7, 11), 2);
  var day = parseInt(binary.substring(11, 16), 2);
  var hour = parseInt(binary.substring(16, 21), 2);
  var minute = parseInt(binary.substring(21, 27), 2);
  var second = parseInt(binary.substring(27, 32), 2) * 2;
  date = new Date(year, month - 1, day, hour, minute, second, 0).toLocaleString();
  return date;
}

function parseSignedInt(bytes) {
  bytes = reverseBytes(bytes);
  var rno = hexStringToByteArray(bytes);
  var n = 0;

  if (rno.length === 4) {
    n = ((rno[0] << 24) & 0xff000000) | ((rno[1] << 16) & 0x00ff0000) | ((rno[2] << 8) & 0x0000ff00) | ((rno[3] << 0) & 0x000000ff);
  }

  return n;
}

function parseUnsignedInt(bytes) {
  bytes = reverseBytes(bytes);
  var n = parseInt(bytes, 16);
  return n;
}

function parseSignedShort(bytes) {
  bytes = reverseBytes(bytes);
  var rno = hexStringToByteArray(bytes);
  var n = 0;

  if (rno.length === 2) {
    var n = (((rno[0] << 8) | rno[1]) << 16) >> 16;
  }

  return n;
}

function parseUnsignedShort(bytes) {
  bytes = reverseBytes(bytes);
  var rno = hexStringToByteArray(bytes);
  var n = 0;

  if (rno.length === 2) {
    n = ((rno[0] << 8) & 0x0000ff00) | ((rno[1] << 0) & 0x000000ff);
  }

  return n;
}

function reverseBytes(bytes) {
  var reversed = bytes;

  if (bytes.length % 2 === 0) {
    reversed = '';

    for (var starting = 0; starting + 2 <= bytes.length; starting += 2) {
      reversed = bytes.substring(starting, starting + 2) + reversed;
    }
  }

  return reversed;
}

function hexStringToByteArray(s) {
  for (var bytes = [], c = 0; c < s.length; c += 2) {
    bytes.push(parseInt(s.substr(c, 2), 16));
  }

  return bytes;
}

function parseDateByte(payload) {
  var date = new Date();
  var binary = (payload[0] & 0xff) + ((payload[1] << 8) & 0xff00) + ((payload[2] << 16) & 0xff0000) + ((payload[3] << 24) & 0xff000000);
  var second = binary & 0x1f;
  second *= 2;
  binary = binary >> 5;
  var minute = binary & 0x3f;
  binary = binary >> 6;
  var hour = binary & 0x1f;
  binary = binary >> 5;
  var day = binary & 0x1f;
  binary = binary >> 5;
  var month = binary & 0x0f;
  binary = binary >> 4;
  var year = binary & 0x7f;
  year += 2000;
  date = new Date(year, month - 1, day, hour, minute, second, 0).toLocaleString();
  return date;
}
