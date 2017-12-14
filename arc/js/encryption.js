/*
 * Arc - Copyleft of Simone 'evilsocket' Margaritelli.
 * evilsocket at protonmail dot com
 * https://www.evilsocket.net/
 *
 * See LICENSE.
 */

const AESKeySize = 256;
const AESSaltSize = 16;
const AESIvSize = 16;
const AESIterations = 100;

const salt_idx  = 0;
const salt_size = AESSaltSize * 2;
const iv_idx    = salt_size;
const iv_size   = AESIvSize * 2;
const data_idx  = iv_idx + iv_size;

const kdfName = "PBKDF2";
const hashName = "SHA-256";
const aesName = "AES-CBC";
const extractable = true;

if (window.crypto && !window.crypto.subtle && window.crypto.webkitSubtle) {
    window.crypto.subtle = window.crypto.webkitSubtle;
}

const crypto = window.crypto;

function isWebCryptoApiSupported() {
    return 'crypto' in window && 'subtle' in window.crypto;
}

async function deriveKey(saltBuf, passphrase) {

    const passphraseKey = await crypto.subtle.importKey("raw", strToUint8(passphrase), {name: kdfName}, !extractable, ["deriveKey"]);

    return await crypto.subtle.deriveKey(
        {name: kdfName, salt: saltBuf, iterations: AESIterations, hash: hashName}
        , passphraseKey
        , {name: aesName, length: AESKeySize}
        , !extractable
        , ["encrypt", "decrypt"]
    );
}

async function AESEncrypt(message, passphrase) {

    const salt = crypto.getRandomValues(new Uint8Array(AESSaltSize));

    const keyBuf = await deriveKey(salt, passphrase);

    const iv = crypto.getRandomValues(new Uint8Array(AESIvSize));

    const ctBuffer = await crypto.subtle.encrypt({name: aesName, iv: iv}, keyBuf, strToUint8(message));

    return bytesToHex(salt) + bytesToHex(iv) + bufferToBase64_2(ctBuffer);
}


/*
 * Encrypted data format is:
 *
 * [hex salt] + [hex iv] + [base64 encrypted data]
 */
async function AESDecrypt(encrypted, passphrase) {

    const salt = new Uint8Array(hexToBytes(encrypted.substr(salt_idx, salt_size)));
    const iv   = new Uint8Array(hexToBytes(encrypted.substr(iv_idx, iv_size)));
    const data = base64ToBuffer(encrypted.substr(data_idx));

    const keyBuf = await deriveKey(salt, passphrase);

    const decrypted = await crypto.subtle.decrypt({name: aesName, iv: iv}, keyBuf, data);

    return uint8ToStr(decrypted);
}

