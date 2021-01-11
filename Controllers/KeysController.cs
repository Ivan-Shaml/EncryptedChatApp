using ChatAppProject.Data;
using ChatAppProject.Models;
using ChatAppProject.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatAppProject.Controllers
{
    [Authorize]
    public class KeysController : Controller
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly UserManager<IdentityUser> _userManager;
        public KeysController(ApplicationDbContext dbContext, UserManager<IdentityUser> userManager)
        {
            _dbContext = dbContext;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> Index(PubKey k)
        {
            string UserName = HttpContext.User.Identity.Name;
            IdentityUser User = await _userManager.FindByNameAsync(UserName);
            if (User != null)
            {
                k = _dbContext.PublicKeys.FirstOrDefault(x => x.UserId == User.Id);
                //if (k != null)
                    return View(k);
            }
            return NotFound();
        }

        [HttpGet]
        public async Task<IActionResult> Delete(int Id)
        {
            string UserName = HttpContext.User.Identity.Name;
            IdentityUser User = await _userManager.FindByNameAsync(UserName);
            if (User != null)
            {
                PubKey k = _dbContext.PublicKeys.FirstOrDefault(x => x.Id == Id);
                if (k.UserId == User.Id)
                {
                    _dbContext.Remove(k);
                    await _dbContext.SaveChangesAsync();
                    return RedirectToAction("Index","Keys");
                }
                return NotFound();
            }
            return RedirectToAction("Index", "Keys");
        }

        [HttpGet]
        public async Task<IActionResult> DeleteActivity()
        {
            string UserName = HttpContext.User.Identity.Name;
            IdentityUser User = await _userManager.FindByNameAsync(UserName);
            if (User != null)
            {
                List<Message> MessagesToDelete = _dbContext.Messages.Where(u => u.RecepientUserId == User.Id || u.SenderUserId.Id == User.Id).ToList();
                _dbContext.RemoveRange(MessagesToDelete);
                await _dbContext.SaveChangesAsync();
                return RedirectToAction("Index", "Keys");
            }

            return NotFound();
        }

        [HttpGet]
        public IActionResult Create()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Create(AddKeyVM k)
        {
            if (ModelState.IsValid)
            {
                string UserName = HttpContext.User.Identity.Name;
                IdentityUser User = await _userManager.FindByNameAsync(UserName);
                if (User != null)
                {
                    PubKey tKey = _dbContext.PublicKeys.FirstOrDefault(key => key.UserId == User.Id);
                    if (tKey == null)
                    {

                        PubKey key = new PubKey
                        {
                            ParentUser = User,
                            UserId = User.Id,
                            PublicKey = k.PublicKey,
                            DateAdded = DateTime.Now,

                        };

                        _dbContext.PublicKeys.Add(key);
                        await _dbContext.SaveChangesAsync();
                        return RedirectToAction("Index","Keys");
                    }
                    else
                    {
                        ModelState.AddModelError("KeyErr", "There is already a key associated with this account!");
                        return View(k);
                    }
                }
                else return NotFound();

            }
            else return View(k);
        }

    }
}
