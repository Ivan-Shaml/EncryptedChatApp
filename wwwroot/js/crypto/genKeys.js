function generateKeys() {
    var keySize = 2048;
    var crypt = new JSEncrypt({ default_key_size: keySize });
    crypt.getKey();

    $('#privkey').val(crypt.getPrivateKey());
    $('#PublicKey').val(crypt.getPublicKey());
};

$('#GenerateButton').click(generateKeys);

function sleep(ms) {
    return new Promise(
        resolve => setTimeout(resolve, ms)
    );
}


async function cp() {
    $('#privkey').select();
    document.execCommand("copy");
    $('#cp_btn').text("Copied!");
    await sleep(1500);
    $('#cp_btn').text("Copy");


}

$('#cp_btn').click(cp);