function pr() {
    var Key = "";
    while (Key == null || Key == "") {
        Key = prompt("Please enter your Private Key to proceed",
            "");
    }
    return Key;
}

const privateKey = pr();
console.log(privateKey)

$(document).ready(function () {
    var msg;
    window.scrollTo(0, document.body.scrollHeight);
    $("span[id]").each(function () {
        if (this.id === 'encryped_message') {
            msg = $(this).html();
            console.log(msg);
            var decrypt = new JSEncrypt();
            decrypt.setPrivateKey(privateKey);
            msg = decrypt.decrypt(msg);
            msg = escapeHtml(msg);
            $(this).html(msg);
        }
    })
});

var connection =
    new signalR.HubConnectionBuilder()
        .withUrl("/chat")
        .build();

var uname_string = $("#uname").val();
var notification_sound = new Audio('/sounds/clearly-602.mp3');
var idList;
var pubList;

connection.on("NewMessage",
    function (message) {
        var sendDate = message.date.slice(message.date.indexOf("T") + 1, message.date.indexOf("."));
        var chatInfo = `<div><i>${sendDate}</i> <strong>[${message.user}]</strong>: ${escapeHtml(message.text)} </div>`;
        if (message.user == "SYSTEM") {
            chatInfo = `<div><i>${sendDate}</i> <strong class='text-danger'>[${message.user}]</strong>: ${escapeHtml(message.text)} </div>`;
        }

        var decrypt = new JSEncrypt();
        decrypt.setPrivateKey(privateKey);
        message.text = decrypt.decrypt(message.text);

        chatInfo = `<div><i>${sendDate}</i> <strong>[${message.user}]</strong>: ${escapeHtml(message.text)} </div>`;

        //console.log(sendDate);
        if (uname_string !== message.user) {
            notification_sound.play();
        }
        if (message.user == "SYSTEM") {
            chatInfo = `<div><i>${sendDate}</i> <strong class='text-danger'>[${message.user}]</strong>: ${escapeHtml(message.text)} </div>`;
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
        //console.log(item);
    });

connection.on("UserListId",
    function (lst) {
        //$("#UserList").empty();
        //$("#UserList").append(`<strong class='list-group-item list-group-item-info'>Online Users [${item.length}]</strong>`)
        //for (var i = 0; i < item.length; i++) {
        //    $("#UserList").append("<li class='list-group-item'>" + item[i] + "</li>");
        //}
        idList = lst;
        console.log(idList);
    });

connection.on("UserListPubKeys",
    function (list) {
        //$("#UserList").empty();
        //$("#UserList").append(`<strong class='list-group-item list-group-item-info'>Online Users [${item.length}]</strong>`)
        //for (var i = 0; i < item.length; i++) {
        //    $("#UserList").append("<li class='list-group-item'>" + item[i] + "</li>");
        //}
        pubList = list;
        console.log(pubList);
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
        for (var i = 0; i < idList.length; i++) {
            for (var k = 0; k < pubList.length; k++) {
                if (idList[i] == pubList[k].userId) {
                    var encrypt = new JSEncrypt();
                    encrypt.setPublicKey(pubList[k].publicKey);
                    var encr_message = encrypt.encrypt(unec_message);
                    console.log(encr_message);
                    
                }
            }

            connection.invoke("Send", encr_message, idList[i]);
            window.scrollTo(0, document.body.scrollHeight);
            input.value = "";
        }
    }
});

connection.start().catch(function (err) {
    return console.error(err.toString());
});

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}