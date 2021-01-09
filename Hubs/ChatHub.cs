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
        public ChatHub(ApplicationDbContext dbContext, UserManager<IdentityUser> userManager)
        {
            _dbContext = dbContext;
            _userManager = userManager;
        }
        public async Task Send(string message)
        {
            if (message != "")
            {

                var messageForDB = new Message { User = this.Context.User.Identity.Name, Text = message, Date = DateTime.Now };
                await this.Clients.All.SendAsync(
                    "NewMessage", messageForDB);
                messageForDB.IdentityUser = await _userManager.FindByNameAsync(messageForDB.User);
                await _dbContext.AddAsync(messageForDB);
                await _dbContext.SaveChangesAsync();
            }
        }
    }
}
