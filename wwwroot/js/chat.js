$(document).ready(function () {
    window.scrollTo(0, document.body.scrollHeight);
});

var connection =
    new signalR.HubConnectionBuilder()
        .withUrl("/chat")
        .build();

var uname_string = $("#uname").val();

connection.on("NewMessage",
    function (message) {
        var sendDate = message.date.slice(message.date.indexOf("T") + 1, message.date.indexOf("."));
        var chatInfo = `<div>[${message.user}] (${sendDate}) ${escapeHtml(message.text)} </div>`;
        //console.log(sendDate);
        if (uname_string !== message.user) {
            var audio = new Audio('/sounds/clearly-602.mp3');
            audio.play();
        }
        $("#messagesList").append(chatInfo);
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