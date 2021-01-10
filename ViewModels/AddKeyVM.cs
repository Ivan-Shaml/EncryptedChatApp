using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace ChatAppProject.ViewModels
{
    public class AddKeyVM
    {
        [Required]
        public string PublicKey { get; set; }
    }
}
