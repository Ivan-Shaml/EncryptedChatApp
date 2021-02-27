using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatAppProject.Hubs
{
    public class MessageReceive//This class holds the properties of messages sent from client to server in JSON deserialized fashion
    {
        [JsonProperty("message", ItemTypeNameHandling = TypeNameHandling.None, TypeNameHandling = TypeNameHandling.None)]//Deserialize JSON Automatically
        public string message { get; set; } //the body of the message(encrypted with public key and base64 encoded from client side)

        [JsonProperty("signedMessage", ItemTypeNameHandling = TypeNameHandling.None, TypeNameHandling = TypeNameHandling.None)]
        public string signedMessage { get; set; } //SHA-256 hash of the message, encrypted with the user's private key for authenticity(crypthographic signing)

        [JsonProperty("recipientId", ItemTypeNameHandling = TypeNameHandling.None, TypeNameHandling = TypeNameHandling.None)]
        public string recipientId { get; set; } //The ID of the user it is meant to(and encrypted with his/hers public key)
    }
}
