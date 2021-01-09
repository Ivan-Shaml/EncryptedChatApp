$(document).ready(function () {
    window.scrollTo(0, document.body.scrollHeight);
});

var connection =
    new signalR.HubConnectionBuilder()
        .withUrl("/chat")
        .build();

var uname_string = $("#uname").val();
var notification_sound = new Audio('/sounds/clearly-602.mp3');

connection.on("NewMessage",
    function (message) {
        var sendDate = message.date.slice(message.date.indexOf("T") + 1, message.date.indexOf("."));
        var chatInfo = `<div><i>${sendDate}</i> <strong>[${message.user}]</strong>: ${escapeHtml(message.text)} </div>`;
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
        $("#UserList").append("<strong class='list-group-item list-group-item-info'>Connected Users</strong>")
        for (var i = 0; i < item.length; i++) {
            $("#UserList").append("<li class='list-group-item'>" + item[i] + "</li>");
        }
        //console.log(item);
    });

var input = document.getElementById("messageInput");
input.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        document.getElementById("sendButton").click();
    }
});

$("#sendButton").click(function () {
    var message = $("#messageInput").val();
    if (message == '')
        return false;
    else {
        connection.invoke("Send", message);
        window.scrollTo(0, document.body.scrollHeight);
        input.value = "";
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