/**
 * Convert UTF-8 string to Uint8Array
 * @param str
 */
function utf8ToBuffer(str) {
    var binstr = utf8ToBinaryString(str);
    return binaryStringToBuffer(binstr);
}

function utf8ToBinaryString(str) {
    var escstr = encodeURIComponent(str);
    // replaces any uri escape sequence, such as %0A,
    // with binary escape, such as 0x0A
    var binstr = escstr.replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode(parseInt(p1, 16));
    });

    return binstr;
}

function binaryStringToBuffer(binstr) {
    var buf;

    if ('undefined' !== typeof Uint8Array) {
        buf = new Uint8Array(binstr.length);
    } else {
        buf = [];
    }

    Array.prototype.forEach.call(binstr, function (ch, i) {
        buf[i] = ch.charCodeAt(0);
    });

    return buf;
}

function base64ToBuffer(base64) {
    var binstr = atob(base64);
    return binaryStringToBuffer(binstr);
}

// TODO: remove utf8ToBuffer
function strToUint8(myString){
    return "TextEncoder" in window ? new TextEncoder("utf-8").encode(myString) : utf8ToBuffer(myString);
}

/**
 * Convert Uint8Array to UTF-8 string
 * @param buf
 * @returns {*}
 */
function bufferToUtf8(buf) {
    var binstr = bufferToBinaryString(buf);
    return binaryStringToUtf8(binstr);
}

function bufferToBinaryString(buf) {
    var binstr = Array.prototype.map.call(buf, function (ch) {
        return String.fromCharCode(ch);
    }).join('');

    return binstr;
}

function binaryStringToUtf8(binstr) {
    var escstr = binstr.replace(/(.)/g, function (m, p) {
        var code = p.charCodeAt(0).toString(16).toUpperCase();
        if (code.length < 2) {
            code = '0' + code;
        }
        return '%' + code;
    });

    return decodeURIComponent(escstr);
}

function bufferToBase64(arr) {
    var binstr = bufferToBinaryString(arr);
    return btoa(binstr);
}

function bufferToBase64_2(arrayBuffer) {
    return btoa(new Uint8Array(arrayBuffer)
            .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
}

// TODO: remove bufferToUtf8()
function uint8ToStr(uint8array){
    return "TextDecoder" in window ? new TextDecoder("utf-8").decode(uint8array) : bufferToUtf8(uint8array);
}

/*

 */

function bytesToHex(byteArray) {
    return Array.prototype.map.call(byteArray, function(byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
}

function hexToBytes(hexString) {
    var result = [];
    while (hexString.length >= 2) {
        result.push(parseInt(hexString.substring(0, 2), 16));
        hexString = hexString.substring(2, hexString.length);
    }
    return result;
}