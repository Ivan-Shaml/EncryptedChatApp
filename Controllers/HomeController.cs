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
        public HomeController(ApplicationDbContext dbContext, UserManager<IdentityUser> userManager)
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
        [Authorize]
        public async Task<IActionResult> Chat()
        {
            IdentityUser u = await _userManager.FindByNameAsync(this.HttpContext.User.Identity.Name);
            if (u != null)
            {
                PubKey pk = _dbContext.PublicKeys.FirstOrDefault(k => k.UserId == u.Id);
                if (pk == null)
                    return RedirectToAction("Index", "Keys");

                string UserId = u.Id;
                List<Message> messages = _dbContext.Messages.Where(m => m.Date > DateTime.Now.AddDays(-3) && m.RecepientUserId == UserId).ToList();
                ViewBag.UserId = UserId;
                ViewBag.UserName = u.UserName;
                return View(messages);
            }
            else return RedirectToAction("Index", "Home");
        }


        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
