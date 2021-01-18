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
    [Authorize] //Only logged in users have access
    public class KeysController : Controller
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly UserManager<IdentityUser> _userManager;
        public KeysController(ApplicationDbContext dbContext, UserManager<IdentityUser> userManager) //Dependency Injection
        {
            _dbContext = dbContext;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> Index(PubKey k) //Show the public key and it's metadata
        {
            string UserName = HttpContext.User.Identity.Name; //get the current logged in user's username
            IdentityUser User = await _userManager.FindByNameAsync(UserName); //Query DB
            if (User != null) //validate the user
            {
                k = _dbContext.PublicKeys.FirstOrDefault(x => x.UserId == User.Id); //get the public key and it's metadata associated with the user
                    return View(k);
            }
            return NotFound(); //If User is Invalid - return 404
        }

        [HttpGet]
        public async Task<IActionResult> Delete(int Id) //Delete the public key, @PARAMS: Id - the ID for the key saved in the database
        {
            string UserName = HttpContext.User.Identity.Name; //get the current logged in user's username
            IdentityUser User = await _userManager.FindByNameAsync(UserName); //Query DB
            if (User != null) //validate the user
            {
                PubKey k = _dbContext.PublicKeys.FirstOrDefault(x => x.Id == Id); //get the associated key from database by Keys ID
                if (k.UserId == User.Id) // Check if that Key ID matches the User ID of from the Request
                {
                    _dbContext.Remove(k);
                    await _dbContext.SaveChangesAsync();
                    return RedirectToAction("Index","Keys"); //If it matches, delete the key
                }
                return NotFound(); //else return 404
            }
            return RedirectToAction("Index", "Keys"); //if user is invalid - redirect to /Keys/Index
        }

        [HttpGet]
        public async Task<IActionResult> DeleteActivity() //Deletes all chat activity of that user (sent and recieved messages)
        {
            string UserName = HttpContext.User.Identity.Name; //get the current logged in user's username
            IdentityUser User = await _userManager.FindByNameAsync(UserName); //Query DB
            if (User != null) //validate the user
            {
                List<Message> MessagesToDelete = _dbContext.Messages.Where(u => u.RecepientUserId == User.Id || u.SenderUserId == User.Id).ToList(); //get all messages that are sent or recieved by the User and delete them from DB
                _dbContext.RemoveRange(MessagesToDelete);
                await _dbContext.SaveChangesAsync();
                return RedirectToAction("Index", "Keys");
            }
            return NotFound(); // If user is invalid, return 404
        }

        [HttpGet]
        public IActionResult Create() //Create form for key
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken] //CSRF Protection Token Verification
        public async Task<IActionResult> Create(AddKeyVM k)
        {
            if (ModelState.IsValid)
            {
                string UserName = HttpContext.User.Identity.Name; //get the current logged in user's username
                IdentityUser User = await _userManager.FindByNameAsync(UserName);//Query DB
                if (User != null) //validate the user
                {
                    PubKey tKey = _dbContext.PublicKeys.FirstOrDefault(key => key.UserId == User.Id); //Check if the user has already a public key associated
                    if (tKey == null) //If there is no key already, create a new one
                    {

                        PubKey key = new PubKey //Get the Values from the POST Request and make a new object of type PubKey and persist to DB
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
                    else //If user has already a key associated - return error message
                    {
                        ModelState.AddModelError("KeyErr", "There is already a key associated with this account!");
                        return View(k);
                    }
                }
                else return NotFound(); //If the User is Inavlid - return 404

            }
            else return View(k); //If the modelstate is invalid - return the page with the model's errors
        }

    }
}
