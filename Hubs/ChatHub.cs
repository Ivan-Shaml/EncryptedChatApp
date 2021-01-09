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
        public async Task Send(string message)
        {
            if (message.Length < 100000 && message != "")
            {
                Message messageForDB = new Message { User = this.Context.User.Identity.Name, Text = message, Date = DateTime.Now };
                messageForDB.IdentityUser = await _userManager.FindByNameAsync(messageForDB.User);
                if (messageForDB.IdentityUser != null)
                {
                    await this.Clients.All.SendAsync(
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
            await this.Clients.All.SendAsync(
                                            "UserList", CurrentUsers);
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
