using ChatAppProject.Data;
using ChatAppProject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace ChatAppProject.Controllers
{
    public class HomeController : Controller
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly UserManager<IdentityUser> _userManager;
        public HomeController(ApplicationDbContext dbContext, UserManager<IdentityUser> userManager) //Dependecy Injection
        {
            _dbContext = dbContext;
            _userManager = userManager;
        }

        [HttpGet]
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        [Authorize] //Only logged in users can open the Chat page
        public async Task<IActionResult> Chat()
        {
            IdentityUser u = await _userManager.FindByNameAsync(this.HttpContext.User.Identity.Name);
            if (u != null) // validate the user
            {
                PubKey pk = _dbContext.PublicKeys.FirstOrDefault(k => k.UserId == u.Id);
                if (pk == null)
                    return RedirectToAction("Index", "Keys"); // if user has not a public key associated with the account, gets redirected to the keys page

                string UserId = u.Id;
                List<Message> messages = _dbContext.Messages.Where(m => m.Date > DateTime.Now.AddDays(-3) && m.RecepientUserId == UserId).ToList(); // Pull the messages from the DB, from the last 3 Days (older messages can be deleted through crontab)
                ViewBag.UserId = UserId;//
                ViewBag.UserName = u.UserName; // Put the UID and UNAME in the CHAT View, to be used in the Java Script
                return View(messages);
            }
            else return RedirectToAction("Index", "Home"); // If the User is invalid, return to index page
        }


        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)] // standard .net code error page handling ...
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
