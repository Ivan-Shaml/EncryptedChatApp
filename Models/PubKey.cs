using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace ChatAppProject.Models
{
    public class PubKey
    {
        [Key]
        public int Id { get; set; } //Primary Key
        [Required]
        public string UserId { get; set; } //The UID of the user that this key belongs to
        [Required]
        public string PublicKey { get; set; } //The Public key itself
        public DateTime DateAdded { get; set; } //Added Date
        [ForeignKey("UserId")] //EF Core Navigational Property
        public virtual IdentityUser ParentUser { get; set; }
    }
}
