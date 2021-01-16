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
        private static List<string> CurrentUsers = new List<string>();
        public ChatHub(ApplicationDbContext dbContext, UserManager<IdentityUser> userManager)
        {
            _dbContext = dbContext;
            _userManager = userManager;
        }
        public async Task Send(string message, string recipientId)
        {
            if (message.Length < 100000 && message != "")
            {
                Message messageForDB = new Message { User = this.Context.User.Identity.Name, Text = message, Date = DateTime.Now };
                IdentityUser s = await _userManager.FindByNameAsync(messageForDB.User);
                IdentityUser r = await _userManager.FindByIdAsync(recipientId);
                if (s != null && r != null)
                {
                    messageForDB.RecepientUserId = r.Id;
                    messageForDB.SenderUserId = r.Id;
                    
                    await this.Clients.User(recipientId).SendAsync(
                                                            "NewMessage", messageForDB);

                    await _dbContext.AddAsync(messageForDB);
                    await _dbContext.SaveChangesAsync();
                }
            }
        }

        public override async Task OnConnectedAsync()
        {
            Message message = new Message { User = "SYSTEM", Text = this.Context.User.Identity.Name + " has joined the chat.", Date = DateTime.Now };
            await this.Clients.AllExcept(this.Context.ConnectionId).SendAsync(
                                            "NewMessage", message);
            
            CurrentUsers.Add(this.Context.User.Identity.Name);
            var AllUsersPublicKeys = _dbContext.PublicKeys.Select(item => new
                                                                    {
                                                                        userId = item.UserId,
                                                                        userName = item.ParentUser.UserName,
                                                                        publicKey = item.PublicKey
                                                                    }).ToList();
            await this.Clients.All.SendAsync(
                                            "UserList", CurrentUsers);
            await this.Clients.All.SendAsync(
                                            "UserListPubKeys", AllUsersPublicKeys);
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        { 
            Message message = new Message { User = "SYSTEM", Text = this.Context.User.Identity.Name + " has left the chat.", Date = DateTime.Now };
            await this.Clients.AllExcept(this.Context.ConnectionId).SendAsync(
                                            "NewMessage", message);

            string connection = CurrentUsers.FirstOrDefault(u => u == this.Context.User.Identity.Name);
            if (connection != null)
                CurrentUsers.Remove(connection);

            await this.Clients.All.SendAsync(
                                "UserList", CurrentUsers);

            await base.OnDisconnectedAsync(exception);
        }
    }
}
