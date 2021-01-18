using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace ChatAppProject.Models
{
    public class Message
    {
        [Key]
        public int Id { get; set; } //Primary Key
        [Required]
        public string User { get; set; } //The username of the Sender User
        [Required]
        public string Text { get; set; } //The Body of the Message
        [Required]
        public DateTime Date { get; set; } //Date that it's send
        [Required]
        public string RecepientUserId { get; set; } //The Id of the user that it is meant for
        [Required]
        public string SenderUserId { get; set; } //The Id of the user who send it
        
        [ForeignKey("SenderUserId")] //EF Core Navigation Property
        public virtual IdentityUser ParrentSenderUserId { get; set; }
    }
}
