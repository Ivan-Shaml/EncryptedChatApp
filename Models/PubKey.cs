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
        public int Id { get; set; }
        [Required]
        public string UserId { get; set; }
        [Required]
        public string PublicKey { get; set; }
        public DateTime DateAdded { get; set; }
        [ForeignKey("UserId")]
        public virtual IdentityUser ParentUser { get; set; }
    }
}
