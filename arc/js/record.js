/*
 * Arc - Copyleft of Simone 'evilsocket' Margaritelli.
 * evilsocket at protonmail dot com
 * https://www.evilsocket.net/
 *
 * See LICENSE.
 */
function Record(title) {
    this.title = title
    this.entries = [];
    this.error = null;
}

Record.prototype.AddEntry = function(entry) {
    this.entries.push(entry);
}

Record.prototype.SetError = function(error) {
    console.log( "RECORD ERROR: " + error);
    this.entries = [];
    this.error = error;
}

Record.prototype.HasError = function() {
    return ( this.error != null );
}

Record.prototype.Encrypt = async function( key ) {
    for( var i = 0; i < this.entries.length; i++ ) {
        this.entries[i].is_new = false;
    }

    var data = JSON.stringify(this.entries); 

    console.log( "Encrypting " + data.length + " bytes of record." );
    // console.log(data);

    return await AESEncrypt( data, key );

    // console.log( "Encrypted data is " + data.length + " bytes." );
    // console.log(data);
}

Record.prototype.isValidData = function(data) {
    return ( data == "[]" || data.indexOf('"value"') != -1 );
}

Record.prototype.Decrypt = async function( key, data ) {
    console.log( "Decrypting " + data.length + " bytes of record." );
    // console.log(data);

    try {
        data = await AESDecrypt( data, key );
        // console.log(data);
    }
    catch(err) {
        console.error(err);
        this.SetError( "Error while decrypting record data." );
        return;
    }

    console.log( "Decrypted data is " + data.length + " bytes." );

    // quick and dirty check
    if( this.isValidData(data) == false ) {
        this.SetError( "Error while decrypting record data." );
    } else {
        var objects = JSON.parse(data);

        console.log( "Record has " + objects.length + " entries." );
        // console.log(data);

        var entries = [];
        for( var i = 0; i < objects.length; i++ ) {
            var entry = TypeFactory(objects[i]);
            // console.log( "record.entries[" + i + "] = " + entry.TypeName() );
            entries.push(entry);
        }
        return entries;
    }
}

