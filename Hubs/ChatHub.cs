using ChatAppProject.Data;
using ChatAppProject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Cryptography;

namespace ChatAppProject.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly UserManager<IdentityUser> _userManager;
        private static List<string> CurrentUsers = new List<string>(); //List of usernames of the current users connected to the chatroom, used in the frontend
        
        const int MESSAGE_PAYLOAD_LEN = 345; //With RSA 2048 bit key, the max base64 string is of length exactly 345(+ "%" sign for whisper traffic)
        const int SIGNED_MESSAGE_PAYLOAD_LEN = 344; //With RSA 2048 bit key, the max base64 string of the SHA-256 hash is exactly 344 chars long
        // as for RSA 4096 bit keys the values will be the following -> MESSAGE_PAYLOAD_LEN = 685; and SIGNED_MESSAGE_PAYLOAD_LEN = 684;
        public ChatHub(ApplicationDbContext dbContext, UserManager<IdentityUser> userManager) //Dependency Injection
        {
            _dbContext = dbContext;
            _userManager = userManager;
        }

        //METHODS CALLED FROM THE CLIENT SIDE JavaScript
        //@PARAMS: 
        //string message: the body of the message(encrypted with public key and base64 encoded from client side);
        //string signedMessage: SHA-256 hash of the message, encrypted with the user's private key for authenticity(crypthographic signing);
        //string recipientId: The ID of the user it is meant to(and encrypted with his/hers public key);
        public async Task Send(string message, string signedMessage, string recipientId)
        {
            if ( (message.Length <= MESSAGE_PAYLOAD_LEN && message != string.Empty) && (signedMessage.Length <= SIGNED_MESSAGE_PAYLOAD_LEN && signedMessage != string.Empty) ) // check if the message has valid payload
            {
                Message messageForDB = new Message { User = this.Context.User.Identity.Name, Text = message, Date = DateTime.Now, signedMessage = signedMessage}; //new Message object
                IdentityUser s = await _userManager.FindByNameAsync(messageForDB.User); //Query DB for Valid Sender And Recipient
                IdentityUser r = await _userManager.FindByIdAsync(recipientId);
                if (s != null && r != null) // Validate the results from Query
                {
                    await this.Clients.User(recipientId).SendAsync(
                                                            "NewMessage", messageForDB); //Send to the Recipient User in the Chat

                    messageForDB.RecepientUserId = r.Id; //Assign the RecepientUserId and SenderUserId
                    messageForDB.SenderUserId = r.Id;
                    
                    await _dbContext.AddAsync(messageForDB); //Persist to DB
                    await _dbContext.SaveChangesAsync();
                }
            }
        }

        public override async Task OnConnectedAsync() //On User Connect to chat
        {
            Message message = new Message { User = "SYSTEM", Text = this.Context.User.Identity.Name + " has joined the chat.", Date = DateTime.Now };
            await this.Clients.AllExcept(this.Context.ConnectionId).SendAsync(
                                            "NewMessage", message);//Send a notification that the user has joined, except the connected user itself

            CurrentUsers.Add(this.Context.User.Identity.Name); //add the user to the Current Connected Users List
            var AllUsersPublicKeys = _dbContext.PublicKeys.Select(item => new
                                                                    {
                                                                        userId = item.UserId,
                                                                        userName = item.ParentUser.UserName,
                                                                        publicKey = item.PublicKey
                                                                    }).ToList();//Query DB for all the public keys and send to all users (update all client side pub keys)
            await this.Clients.All.SendAsync(
                                            "UserList", CurrentUsers); //Update the Current Connected Users List
            await this.Clients.All.SendAsync(
                                            "UserListPubKeys", AllUsersPublicKeys); //Update all users client side pubkey array
            await base.OnConnectedAsync(); //Call base method
        }

        public override async Task OnDisconnectedAsync(Exception exception) //On User Disconnect from chat
        { 
            Message message = new Message { User = "SYSTEM", Text = this.Context.User.Identity.Name + " has left the chat.", Date = DateTime.Now };
            await this.Clients.AllExcept(this.Context.ConnectionId).SendAsync(
                                            "NewMessage", message);//Send a notification that the user has left, except the connected user itself

            string connection = CurrentUsers.FirstOrDefault(u => u == this.Context.User.Identity.Name);
            if (connection != null)
                CurrentUsers.Remove(connection); //Kill the Connection

            await this.Clients.All.SendAsync(
                                "UserList", CurrentUsers); //Update the Current Connected Users List

            await base.OnDisconnectedAsync(exception); //Call base method
        }
    }
}
