// UserSettingsDto.cs
namespace TicketBookingBackend.Models
{
    public class UserSettingsDto
    {
        public string Name { get; set; }          
        public string Email { get; set; }
        public string Phone { get; set; }     
        public bool NotificationsEnabled { get; set; }
        public bool DarkMode { get; set; }        
        public string? ProfilePictureUrl { get; set; }
    }
}

// UpdatePasswordDto.cs
namespace TicketBookingBackend.Models
{
    public class UpdatePasswordDto
    {
        public string CurrentPassword { get; set; }
        public string NewPassword { get; set; }
    }

    public class AvatarUploadResponse
    {
        public string AvatarUrl { get; set; }
    }
}