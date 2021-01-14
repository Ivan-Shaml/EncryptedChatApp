var connection =
    new signalR.HubConnectionBuilder()
        .withUrl("/chat")
        .build();

var uname_string = $("#thisUNAME").val();
var notification_sound = new Audio('/sounds/clearly-602.mp3');
var whisper_sound = new Audio('/sounds/new_whisper.mp3');
var system_join_sound = new Audio('/sounds/chat_join.mp3');
var system_leave_sound = new Audio('/sounds/chat_leave.mp3');
var pubList;
var triger = true;
var whisper = false;
var privateKey;

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

connection.on("NewMessage",
    function (message) {
        var sendDate = message.date.slice(message.date.indexOf("T") + 1, message.date.indexOf("."));
        var chatInfo = `<div><i>${sendDate}</i> <strong>[${message.user}]</strong>: ${escapeHtml(message.text)} </div>`;
        if (message.user == "SYSTEM") {
            chatInfo = `<div><i>${sendDate}</i> <strong class='text-danger'>[${message.user}]</strong>: ${escapeHtml(message.text)} </div>`;
            $("#messagesList").append(chatInfo);
            if(message.text.includes("joined")){
                system_join_sound.play();
            }else{
                system_leave_sound.play();
            }
        }

        if (message.text.startsWith("%")){
            message.text = message.text.substring(1);
            var decrypt = new JSEncrypt();
            decrypt.setPrivateKey(privateKey);
            message.text = decrypt.decrypt(message.text);
            if(message.user == uname_string){
            chatInfo = `<div class="whisper"><i>(W)${sendDate}</i> <strong class="text-primary">[${message.user}]</strong>: ${escapeHtml(message.text)} </div>`;
            }else {
                chatInfo = `<div class="whisper"><i>(W)${sendDate}</i> <strong>[${message.user}]</strong>: ${escapeHtml(message.text)} </div>`;
                whisper_sound.play();
            }
            $("#messagesList").append(chatInfo);
        }else{
            var decrypt = new JSEncrypt();
            decrypt.setPrivateKey(privateKey);
            message.text = decrypt.decrypt(message.text);

            if (message.user == uname_string) {
                chatInfo = `<div><i>${sendDate}</i> <strong class="text-primary">[${message.user}]</strong>: ${escapeHtml(message.text)} </div>`;
            } else {
                chatInfo = `<div><i>${sendDate}</i> <strong>[${message.user}]</strong>: ${escapeHtml(message.text)} </div>`;
                notification_sound.play();
            }

            $("#messagesList").append(chatInfo);
        }
    });

connection.on("UserList",
    function (item) {
        $("#UserList").empty();
        $("#UserList").append(`<strong class='list-group-item list-group-item-info'>Online Users [${item.length}]</strong>`)
        for (var i = 0; i < item.length; i++) {
            $("#UserList").append("<li class='list-group-item'>" + item[i] + "</li>");
        }
    });

connection.on("UserListPubKeys",
    function (list) {
        pubList = list;
        console.log(pubList);
        if (triger) {
            privateKey = prompt_private_key();
            check_private_key();
        }
    });

var input = document.getElementById("messageInput");
input.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        document.getElementById("sendButton").click();
    }
    //if (input.value.startsWith("@")) {
    //    console.log("Whisper");
    //}
});

var recipient_pubKey;
var recipient_userId;
$("#sendButton").click(function () {
    var unec_message = $("#messageInput").val();
    unec_message = escapeHtml(unec_message);
    if (unec_message == '')
        return false;
    else if (unec_message.startsWith("@")) {
        var w_recipient_name = unec_message.substring(1,unec_message.indexOf(' '));
        unec_message = unec_message.substring(unec_message.indexOf(' ')+1);
        for (var i = 0; i < pubList.length; i++) {
            if (pubList[i].userName == w_recipient_name){
                recipient_pubKey = pubList[i].publicKey;
                recipient_userId = pubList[i].userId;
                break;
            }}
            if(recipient_pubKey != null && unec_message.trim().length && recipient_pubKey != thisUserPubKey){
                var encrypt = new JSEncrypt();
                encrypt.setPublicKey(recipient_pubKey);
                var encr_message = encrypt.encrypt(unec_message);
                encr_message = "%" + encr_message;
                connection.invoke("Send", encr_message, recipient_userId);
                encrypt.setPublicKey(thisUserPubKey);
                var encr_message = encrypt.encrypt(unec_message);
                encr_message = "%" + encr_message;
                connection.invoke("Send", encr_message, UserId);
                window.scrollTo(0, document.body.scrollHeight);
                $("#messageInput").val('');
                recipient_userId = null;
                recipient_pubKey = null;
                $("#messageInput").removeClass("invalid_recipient");
            }else{
                $("#messageInput").addClass("invalid_recipient");
            }
        }

    else {
            for (var i = 0; i < pubList.length; i++) {
                var encrypt = new JSEncrypt();
                encrypt.setPublicKey(pubList[i].publicKey);
                var encr_message = encrypt.encrypt(unec_message);
                console.log("NORMAL Message Send");
                connection.invoke("Send", encr_message, pubList[i].userId);
            }
            $("#messageInput").removeClass("invalid_recipient");
            window.scrollTo(0, document.body.scrollHeight);
            input.value = "";
        }
});

connection.start().catch(function (err) {
    return console.error(err.toString());
});

function prompt_private_key() {
    var Key = "";
    while (Key == null || Key == "") {
        Key = prompt("Please enter your Private Key to proceed",
            "");
    }
    return Key;
}


////

var msg;
var UserId = $("#thisUID").val();
var thisUserPubKey;
var test_msg;
var dec_test_msg;
function check_private_key() {
    for (var i = 0; i < pubList.length; i++) {
        if (pubList[i].userId == UserId) {
            thisUserPubKey = pubList[i].publicKey;
            var encrypt = new JSEncrypt();
            encrypt.setPublicKey(thisUserPubKey);
            test_msg = encrypt.encrypt("test123");
            break;
        }
    }

    while (triger) {
        var decrypt = new JSEncrypt();
        decrypt.setPrivateKey(privateKey);
        dec_test_msg = decrypt.decrypt(test_msg);
        if (dec_test_msg != "test123") {
            triger = true;
            alert("Wrong Private Key!")
            privateKey = prompt_private_key();
        } else triger = false;
    }


    $("span[id]").each(function () {
        if (this.id === 'encryped_message') {
            msg = $(this).html();
            var decrypt = new JSEncrypt();
            decrypt.setPrivateKey(privateKey);
            msg = decrypt.decrypt(msg);
            msg = escapeHtml(msg);
            $(this).html(msg);
        }

    });

    $("strong[id]").each(function () {
        if (this.id === "m_uid" && this.innerText === `[${uname_string}]`) {
            $(this).addClass("text-primary");
        }
    });

};
////

$(document).ready(function () {
    window.scrollTo(0, document.body.scrollHeight);
});
