var connection =
    new signalR.HubConnectionBuilder()
        .withUrl("/chat")
        .build();

var uname_string = $("#thisUNAME").val();
var notification_sound = new Audio('/sounds/clearly-602.mp3');
var pubList;
var triger = true;
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
        }

        var decrypt = new JSEncrypt();
        decrypt.setPrivateKey(privateKey);
        message.text = decrypt.decrypt(message.text);

        chatInfo = `<div><i>${sendDate}</i> <strong>[${message.user}]</strong>: ${escapeHtml(message.text)} </div>`;

        if (uname_string !== message.user) {
            notification_sound.play();
        }

        $("#messagesList").append(chatInfo);
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
        //console.log(pubList);
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
});

$("#sendButton").click(function () {
    var unec_message = $("#messageInput").val();
    unec_message = escapeHtml(unec_message);
    if (unec_message == '')
        return false;
    else {
            for (var i = 0; i < pubList.length; i++) {
                var encrypt = new JSEncrypt();
                encrypt.setPublicKey(pubList[i].publicKey);
                var encr_message = encrypt.encrypt(unec_message);
                connection.invoke("Send", encr_message, pubList[i].userId);
            }
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

};
////

$(document).ready(function () {
    window.scrollTo(0, document.body.scrollHeight);
});
