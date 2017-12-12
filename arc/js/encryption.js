/*
 * Arc - Copyleft of Simone 'evilsocket' Margaritelli.
 * evilsocket at protonmail dot com
 * https://www.evilsocket.net/
 *
 * See LICENSE.
 */

var AESKeySize = 256;
var AESSaltSize = 16;
var AESIvSize = 16;
var AESIterations = 100;

var kdfName = "PBKDF2";
var hashName = "SHA-256";
var aesName = "AES-CBC";
var extractable = true;

if (window.crypto && !window.crypto.subtle && window.crypto.webkitSubtle) {
    window.crypto.subtle = window.crypto.webkitSubtle;
}

var crypto = window.crypto;

function isWebCryptoApiSupported() {
    return 'crypto' in window && 'subtle' in window.crypto;
}

function deriveKey(saltBuf, passphrase) {

    return crypto.subtle.importKey("raw", strToUint8(passphrase), {name: kdfName}, !extractable, ["deriveKey"])
        .then(function (passphraseKey) {
            return crypto.subtle.deriveKey(
                {name: kdfName, salt: saltBuf, iterations: AESIterations, hash: hashName}
                , passphraseKey
                , {name: aesName, length: AESKeySize}
                , extractable
                , ["encrypt", "decrypt"]
            );
        })
        .then(function (aesKey) {
            return crypto.subtle.exportKey("raw", aesKey)
                .then(function (arrbuf) {
                    return new Uint8Array(arrbuf);
                });
        })
        .catch(function (err) {
            window.alert("Key derivation failed: " + err.message);
        });
}

function WCEncrypt(message, passphrase) {
    var salt = new Uint8Array(AESSaltSize);
    crypto.getRandomValues(salt);

    return deriveKey(salt, passphrase)
        .then(function (keyBuf) {

            var iv = new Uint8Array(AESIvSize);
            crypto.getRandomValues(iv);

            return crypto.subtle.encrypt(
                {name: aesName, iv: iv}
                , keyBuf
                , strToUint8(message))
                .then(function (encrypted) {
                    return bytesToHex(salt) + bytesToHex(iv) + bufferToBase64(encrypted);
                })
                .catch(function (err) {
                    window.alert("Encryption failed: " + err.message);
                })
        });
}

function CJSEncrypt(message, passphrase) {
    var salt = CryptoJS.lib.WordArray.random(AESSaltSize);
    var key  = CryptoJS.PBKDF2( passphrase, salt, {
        keySize: AESKeySize / 32,
        iterations: AESIterations
    });

    var iv = CryptoJS.lib.WordArray.random(AESIvSize);
    var encrypted = CryptoJS.AES.encrypt( message, key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
    });

    return salt.toString()+ iv.toString() + encrypted.toString();
}

function AESEncrypt(message, passphrase) {
    return isWebCryptoApiSupported() ? WCEncrypt(message, passphrase) : CJSEncrypt(message, passphrase);
}


function WCDecrypt(encrypted, passphrase) {
    var salt_idx  = 0;
    var salt_size = AESSaltSize * 2;
    var iv_idx    = salt_size;
    var iv_size   = AESIvSize * 2;
    var data_idx  = iv_idx + iv_size;

    var salt = hexToBytes(encrypted.substr(salt_idx, salt_size));
    var iv   = hexToBytes(encrypted.substr(iv_idx, iv_size));
    var data = base64ToBuffer(encrypted.substr(data_idx));

    return deriveKey(salt, passphrase)
        .then(function (keyBuf) {
            return crypto.subtle.decrypt({name: aesName, iv: iv}, keyBuf, data)
                .then(function (decrypted) {
                    return uint8ToStr(decrypted);
                })
                .catch(function (err) {
                    window.alert("Decryption failed: " + err.message);
                })
        })
        .catch(function (err) {
            window.alert("Key derivation failed: " + err.message);
        })
}

function CJSDecrypt(message, passphrase) {
    var salt_idx  = 0;
    var salt_size = AESSaltSize * 2;
    var iv_idx    = salt_size;
    var iv_size   = AESIvSize * 2;
    var data_idx  = iv_idx + iv_size;

    var salt = CryptoJS.enc.Hex.parse( encrypted.substr(salt_idx, salt_size) );
    var key = CryptoJS.PBKDF2( passphrase, salt, {
        keySize: AESKeySize / 32,
        iterations: AESIterations
    });

    var iv = CryptoJS.enc.Hex.parse(encrypted.substr(iv_idx, iv_size));
    var data = encrypted.substring(data_idx);

    var decrypted = CryptoJS.AES.decrypt( data, key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
}

/*
 * Encrypted data format is:
 *
 * [hex salt] + [hex iv] + [base64 encrypted data]
 */
function AESDecrypt(encrypted, passphrase) {
    return isWebCryptoApiSupported() ? WCDecrypt(encrypted, passphrase) : CJSDecrypt(encrypted, passphrase);
}

