var connection =
    new signalR.HubConnectionBuilder()
        .withUrl("/chat")
        .build();//SignalR connection builder

const MESSAGE_LENGTH = 245; // the max RSA encryption length for 2048 bit key Modulus, if the message is longer, the library would fail

var uname_string = $("#thisUNAME").val();//This User's Username
//UX Sounds
var notification_sound = new Audio('/sounds/clearly-602.mp3');
var whisper_sound = new Audio('/sounds/new_whisper.mp3');
var system_join_sound = new Audio('/sounds/chat_join.mp3');
var system_leave_sound = new Audio('/sounds/chat_leave.mp3');
var mitm_alert = new Audio('/sounds/mitm_alert.mp3');
//

var pubList; //Array of public Keys
var triger = true; //A boolean flag, used in the check if the user specified a valid private key[see connection.on("UserListPubKeys") and check_private_key()]
var privateKey; //Holds the Private Key


connection.onclose(function () {//when the connection is lost-the user is notified and is unable to send/receive messages
    mitm_alert.play();
    alert("Server has disconnected! Please, try to refresh the page...");
    $("#messageInput").addClass("invalid_recipient");
    $("#messageInput").val("You are Offline! Please, refresh the page...");
    $("#messageInput").attr("disabled", true);
    $("#sendButton").attr("disabled", true);
});

function escapeHtml(unsafe) {//RegEx Check the string and returns a replaced one, with HTML Safe Characters (XSS Prevention)
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

connection.on("NewMessage",//on Server Sent - new message; if a new message for this user is recieved [WHEN THE SERVER SENDS MESSAGE TO CLIENT]
    function (message) {
        var sendDate = message.date.slice(message.date.indexOf("T") + 1, message.date.indexOf("."));//get only the short part from DateTime C# format
        var chatInfo;//Example string of the chat message
        //var chatInfo = `<div><i>${sendDate}</i> <strong>[${message.user}]</strong>: ${escapeHtml(message.text)} </div>`; //Example string of the chat message(not printed, only declared)
        if (message.user === "SYSTEM") {//if the message comes from system(OnDisconnectedAsync or OnDisconnectedAsync, make the approp UI)
            chatInfo = `<div><i>${sendDate}</i> <strong class='text-danger'>[${message.user}]</strong>: ${escapeHtml(message.text)} </div>`;
            $("#messagesList").append(chatInfo);
            if (message.text.includes("has joined the chat")) { //Check if the message is about User Join, User Leave or Error Message and play approp sound
                system_join_sound.play();
                return false;
            } else if (message.text.includes("An error with your last message has occurred and it was not sent")){
                mitm_alert.play();
                return false;
            } else {
                system_leave_sound.play();
                return false;
            }
        }

        if (message.text.startsWith("%")){//Check if message is from Whisper Conversation
            var sender_pubKey;//holds the public key of the sender user, used for the crypto signing later
            var b64Value = message.text;//holds the encrypted and base64 encoded message, to be verified and signed for authenticity
            message.text = message.text.substring(1);//Cut the % sign
            var decrypt = new JSEncrypt();//Create new JSEncryption Object
            decrypt.setPrivateKey(privateKey);//Set the Private key
            message.text = decrypt.decrypt(message.text);//decrypt the message text
            for (var i = 0; i < pubList.length; i++) {//iterate the public key collection, to find the key of the sender user
                if (pubList[i].userName == message.user) {
                    sender_pubKey = pubList[i].publicKey;
                    break;
                }
            }
            decrypt.setPublicKey(sender_pubKey);//set it
            var ver = decrypt.verify(b64Value, message.signedMessage, sha256_digest);//and verify the signature/authenticity of the message
            if (ver === false) {//if the message is tampered with - alert the user
                chatInfo = `<div><i>${sendDate}</i> <strong class='text-danger'>[SECURITY SYSTEM]</strong>: Possible MITM! - Signature mismatch for sender user: ${escapeHtml(message.user)} </div>`;
                $("#messagesList").append(chatInfo);
                mitm_alert.play();
            }else if(message.user == uname_string){//if the message comes from the same logged user, make UI change, else dont and play a new message sound for whisper
                chatInfo = `<div class="whisper"><i>(W)${sendDate}</i> <strong class="text-primary">[${escapeHtml(message.user)}]</strong>: ${escapeHtml(message.text)} </div>`;
                $("#messagesList").append(chatInfo);
            }else {
                chatInfo = `<div class="whisper"><i>(W)${sendDate}</i> <strong>[${escapeHtml(message.user)}]</strong>: ${escapeHtml(message.text)} </div>`;
                $("#messagesList").append(chatInfo);
                whisper_sound.play();
            }
        }else//if the message is from the regular group chat(non whisper)
        {
            var sender_pubKey;//holds the public key of the sender user, used for the crypto signing later
            var decrypt = new JSEncrypt();//Create new JSEncryption Object
            decrypt.setPrivateKey(privateKey);//Set the Private key
            var b64Value = message.text;//holds the encrypted and base64 encoded message, to be verified and signed for authenticity
            message.text = decrypt.decrypt(message.text);//decrypt the message text
            for (var i = 0; i < pubList.length; i++) {//iterate the public key collection, to find the key of the sender user
                if (pubList[i].userName == message.user) {
                    sender_pubKey = pubList[i].publicKey;
                    break;
                }
            }
            decrypt.setPublicKey(sender_pubKey);//set it
            var ver = decrypt.verify(b64Value, message.signedMessage, sha256_digest);//and verify the signature/authenticity of the message
            if (ver === false) {//if the message is tampered with - alert the user
                chatInfo = `<div><i>${sendDate}</i> <strong class='text-danger'>[SECURITY SYSTEM]</strong>: Possible MITM! - Signature mismatch for sender user: ${escapeHtml(message.user)} </div>`;
                $("#messagesList").append(chatInfo);
                mitm_alert.play();
            }else if (message.user == uname_string) {//if the message comes from the same logged user, make UI change, else dont and play a new message sound
                chatInfo = `<div><i>${sendDate}</i> <strong class="text-primary">[${escapeHtml(message.user)}]</strong>: ${escapeHtml(message.text)} </div>`;
                $("#messagesList").append(chatInfo);
            } else {
                chatInfo = `<div><i>${sendDate}</i> <strong>[${escapeHtml(message.user)}]</strong>: ${escapeHtml(message.text)} </div>`;
                $("#messagesList").append(chatInfo);
                notification_sound.play();
            }
        }
    });

connection.on("UserList",//on Server Sent - UserList; called OnConnectedAsync or OnDisconnectedAsync, updating the current users in chat list
    function (item) {
        $("#UserList").empty();
        $("#UserList").append(`<strong class='list-group-item list-group-item-info'>Online Users [${item.length}]</strong>`)
        for (var i = 0; i < item.length; i++) {
            $("#UserList").append("<li class='list-group-item'>" + escapeHtml(item[i]) + "</li>");
        }
    });

connection.on("UserListPubKeys",//on Server Sent - UserListPubKeys; called OnConnectedAsync or OnDisconnectedAsync, updating the current pubList array with all users and public keys
    function (list) {
        pubList = list;
        if (triger) { //When the pubList is populated, AND the user opens the chat page for the first time, the Private key is needed to continue [see check_private_key() and prompt_private_key()]
            privateKey = prompt_private_key();
            check_private_key();
        }
    });

var input = document.getElementById("messageInput");//the message input box
input.addEventListener("keyup", function (event) {//press Enter = click sendButton
    if (event.keyCode === 13) {
        event.preventDefault();
        document.getElementById("sendButton").click();
    }
});

var recipient_pubKey;//Used in whisper Mode
var recipient_userId;//Used in whisper Mode
$("#sendButton").click(function () {//[WHEN THE CLIENT SENDS MESSAGE TO SERVER]
    var messagesToSend = [];//Will hold the encrypted messages, to pe pushed to server
    var unec_message = $("#messageInput").val();//the text of the input/message box
    //unec_message = escapeHtml(unec_message); //Enable on send too, for better Reflected XSS prevention
    if (unec_message == '')//check if the text is empty
        return false;
    else if (unec_message.startsWith("@")) {//check if the message is for whisper mode
        var w_recipient_name = unec_message.substring(1,unec_message.indexOf(' '));//get the substring of the recipient user
        unec_message = unec_message.substring(unec_message.indexOf(' ') + 1);//get the message text
        if (unec_message.length > MESSAGE_LENGTH) {//check if the message is longer than RSA MODULUS of 2048-bit key
            $("#messageInput").addClass("invalid_recipient");
            alert("Message is too long!");
            return false;
        }
        var signedMsg;//holds the encrypted and base64 encoded message, to be hashed and signed for authenticity
        for (var i = 0; i < pubList.length; i++) {//itterate the array to find the mathcing recipient pubkey and UID
            if (pubList[i].userName == w_recipient_name){
                recipient_pubKey = pubList[i].publicKey;
                recipient_userId = pubList[i].userId;
                break;
            }
        }
            if(recipient_pubKey != null && unec_message.trim().length && recipient_pubKey != thisUserPubKey){ //if the recipient information is valid, encrypt the message
                //and send it once to the recipient and once to the sender user itself, so it can be encrypted with the pubkey and persisted to DB
                var encrypt = new JSEncrypt();//Create new JSEncryption Object
                encrypt.setPublicKey(recipient_pubKey);//encrypt with public key of recipient
                var encr_message = encrypt.encrypt(unec_message);
                encr_message = "%" + encr_message;//add % sign to the base64 encrypted text, to make sure it is marked as whisper message traffic
                encrypt.setPrivateKey(privateKey);//set the private key and be ready for signing the message
                signedMsg = encrypt.sign(encr_message, sha256_digest, "sha256");//sign the SHA-256 hash of the encrypted and base64 encoded message with the private key
                var msg = {//a json object containing the data which will be placed pushed in the main massages array
                    message: encr_message,
                    signedMessage: signedMsg,
                    recipientId: recipient_userId
                };
                messagesToSend.push(msg);//push the json object containing the data to the array
                encrypt.setPublicKey(thisUserPubKey);//encrypt the message with the public key of sender user
                var encr_message = encrypt.encrypt(unec_message);
                encr_message = "%" + encr_message;
                encrypt.setPrivateKey(privateKey);//set the private key and be ready for signing the message
                signedMsg = encrypt.sign(encr_message, sha256_digest, "sha256");//sign the SHA-256 hash of the encrypted and base64 encoded message with the private key
                var msg = {//a json object containing the data which will be placed pushed in the main massages array
                    message: encr_message,
                    signedMessage: signedMsg,
                    recipientId: UserId
                };
                messagesToSend.push(msg);//push the json object containing the data to the array
                connection.invoke("Send", messagesToSend);//invoke the Send method in the chathub(server side) and pass the required data
                window.scrollTo(0, document.body.scrollHeight);//scroll chat window to the end of the page
                $("#messageInput").val('');//clear the message box
                recipient_userId = null;//make sure that there aren't any values for the next round of messages
                recipient_pubKey = null;
                messagesToSend = [];
                $("#messageInput").removeClass("invalid_recipient");//remove the UI for validation
            }else{
                $("#messageInput").addClass("invalid_recipient");//if the recipient user in the whisper conversation that was specified is invalid, trigger the UI validation
                recipient_userId = null;
                recipient_pubKey = null;
                messagesToSend = []; //Make sure the messages array is cleared
            }
    }

    else { // If the message is not marked as Whisper Conversation (message input box value doesn't start with '@')
            messagesToSend = []; //Make sure the messages array is cleared
            if (unec_message.length > MESSAGE_LENGTH) {//check if the message is longer than RSA MODULUS of 2048-bit key
                $("#messageInput").addClass("invalid_recipient");
                alert("Message is too long!");
                return false;
            }
            $("#messageInput").removeClass("invalid_recipient");//remove the UI for validation
            window.scrollTo(0, document.body.scrollHeight);//scroll chat window to the end of the page
            var encrypt = new JSEncrypt();//Create new JSEncryption Object
            for (var i = 0; i < pubList.length; i++) {
                encrypt.setPublicKey(pubList[i].publicKey); //foreach user in the pubList encrypt and send the message with the corresponding Public Key and UID
                var signedMsg;//holds the encrypted and base64 encoded message, to be hashed and signed for authenticity
                var encr_message = encrypt.encrypt(unec_message);//encrypt the plain text message
                encrypt.setPrivateKey(privateKey);//set the private key and be ready for signing the message
                signedMsg = encrypt.sign(encr_message, sha256_digest, "sha256");//sign the SHA-256 hash of the encrypted and base64 encoded message with the private key
                var msg = {//a json object containing the data which will be placed pushed in the main massages array
                    message: encr_message,
                    signedMessage: signedMsg,
                    recipientId: pubList[i].userId
                };
                messagesToSend.push(msg);//push the json object containing the data to the array
            }
            connection.invoke("Send", messagesToSend);//invoke the Send method in the chathub(server side) and pass the message text and recipient UID
            input.value = ""; //clear the message box
            messagesToSend = []; //Make sure the messages array is cleared
        }
});

connection.start().catch(function (err) {//SignalR exception logger
    return console.error(err.toString());
});

function prompt_private_key() {//Js Promt for the User's private key (on page reload)
    var Key = "";
    while (Key == null || Key == "") {
        Key = prompt("Please enter your Private Key to proceed",
            "");
    }
    return Key;
}


////[PRIVATE KEY VALIDATION AND DOM MESSAGES DECRYPTION]

var msg;
var UserId = $("#thisUID").val();//the current user UID
var thisUserPubKey;//The current user's Public Key
var test_msg;//testing of the Private Key provided by User
var dec_test_msg;
function check_private_key() {
    for (var i = 0; i < pubList.length; i++) {
        if (pubList[i].userId == UserId) {//Find the Current user public key from pubList arr and encrypt a test string stored in test_msg 
            thisUserPubKey = pubList[i].publicKey;
            var encrypt = new JSEncrypt();
            encrypt.setPublicKey(thisUserPubKey);
            test_msg = encrypt.encrypt("test123");
            break;
        }
    }

    while (triger) {
        var decrypt = new JSEncrypt();//Create new JSEncryption Object
        decrypt.setPrivateKey(privateKey);//Set the Private Key with the one from the User Input
        dec_test_msg = decrypt.decrypt(test_msg);//and decrypt the test message with it
        if (dec_test_msg != "test123") {//if the decrypted value is different => the private key is wrong
            triger = true;//loop again
            alert("Wrong Private Key!")//alert the user
            privateKey = prompt_private_key();//and re-prompt again
        } else triger = false;// else - stop the loop, the private key is VALID
    }


    $("span[id]").each(function () {//for each Span with id="encryped_message", decrypt, verify the hash and replace the text in the DOM, if hash is invalid - alert the user
        if (this.id === 'encryped_message') {
            msg = $(this).text();
            msg = msg.substr(0, msg.indexOf("==") + 2);
            var b64hash = msg;
            var sender_pubKey;
            var signed_msg = $(this).children('span').html();//get the signed hash of the message (yea I know that is very lazy)
            var usr = $(this).children('i').html();//get the username that sent the message
            if (msg.startsWith("%")) {//check if the message is from whisper traffic, and remove the % sign, because it is base64 forbidden char
                msg = msg.substring(1);
            }
            var decrypt = new JSEncrypt();
            decrypt.setPrivateKey(privateKey);
            msg = decrypt.decrypt(msg);

            for (var i = 0; i < pubList.length; i++) {
                if (pubList[i].userName == usr) {
                    sender_pubKey = pubList[i].publicKey;
                    break;
                }
            }
            decrypt.setPublicKey(sender_pubKey);
            var ver = decrypt.verify(b64hash, signed_msg, sha256_digest);
            if (ver === false) {
                msg = `<strong class='text-danger'>[Possible MITM! - Signature mismatch] </strong>`;
                mitm_alert.play();
                $(this).html(msg);
            } else {
                msg = escapeHtml(msg);
                $(this).html(msg);
            }
        }

    });

    $("strong[id]").each(function () {//for each message, check if the message sender username is same to the user that is logged in and make the user handle blue [UI]
        if (this.id === "m_uid" && this.innerText === `[${uname_string}]`) {
            $(this).addClass("text-primary");
        }
    });

};
////

$(document).ready(function () {//when the document is fully loaded - scroll to the bottom of the page/chat window
    window.scrollTo(0, document.body.scrollHeight);
});
