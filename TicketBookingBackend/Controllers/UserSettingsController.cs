using TicketBookingBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using System.Linq;

namespace TicketBookingBackend.Controllers
{
    
    [Route("api/user/settings")]
    [ApiController]
    [Authorize]
    public class UserSettingsController : ControllerBase
    {
        private readonly TicketBookingDatabaseContext _context;
        private readonly ILogger<UserSettingsController> _logger;
        private readonly IWebHostEnvironment _environment;

        public UserSettingsController(
        TicketBookingDatabaseContext context,
        ILogger<UserSettingsController> logger,
        IWebHostEnvironment environment)
        {
            _context = context;
            _logger = logger;
            _environment = environment;
        }

        // GET: api/user/settings
        [HttpGet]
        public async Task<IActionResult> GetUserSettings()
        {
            if (!TryGetUserId(out int userId))
                return Unauthorized(new { message = "Invalid or missing User ID in token" });

            try
            {
                var user = await _context.Users
                    .Where(u => u.UserId == userId)
                    .Select(u => new UserSettingsDto
                    {
                        
                        Name = u.FullName,
                        Email = u.Email,
                        Phone = u.PhoneNumber,
                        NotificationsEnabled = u.NotificationsEnabled,
                        DarkMode = u.DarkModeEnabled,
                        ProfilePictureUrl = u.ProfilePictureUrl
                    })
                    .FirstOrDefaultAsync();

                if (user == null)
                    return NotFound(new { message = "User not found" });

                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user settings");
                return StatusCode(500, new { message = "Error retrieving user settings" });
            }
        }

        // PUT: api/user/settings
        [HttpPut]
        public async Task<IActionResult> UpdateUserSettings([FromBody] UserSettingsDto settingsDto)
        {
            if (!TryGetUserId(out int userId))
                return Unauthorized(new { message = "Invalid or missing User ID in token" });

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return NotFound(new { message = "User not found" });

                // Update properties
                user.FullName = settingsDto.Name;
                user.Email = settingsDto.Email;
                user.PhoneNumber = settingsDto.Phone;
                user.NotificationsEnabled = settingsDto.NotificationsEnabled;
                user.DarkModeEnabled = settingsDto.DarkMode;
                user.UpdatedAt = DateTime.UtcNow;

                _context.Entry(user).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user settings");
                return StatusCode(500, new { message = "Error updating user settings" });
            }
        }

        // POST: api/user/settings/password
        [HttpPost("password")]
        public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordDto passwordDto)
        {
            if (!TryGetUserId(out int userId))
                return Unauthorized(new { message = "Invalid or missing User ID in token" });

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return NotFound(new { message = "User not found" });

                // Verify current password (you'll need to implement your password hashing logic)
                if (!VerifyPassword(passwordDto.CurrentPassword, user.PasswordHash))
                    return BadRequest(new { message = "Current password is incorrect" });

                // Update password
                user.PasswordHash = HashPassword(passwordDto.NewPassword); // Implement your hashing
                user.UpdatedAt = DateTime.UtcNow;

                _context.Entry(user).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating password");
                return StatusCode(500, new { message = "Error updating password" });
            }
        }
        [HttpPost("avatar")]
        public async Task<IActionResult> UploadAvatar(IFormFile avatar)
        {
            if (!TryGetUserId(out int userId))
                return Unauthorized(new { message = "Invalid or missing User ID in token" });

            if (avatar == null || avatar.Length == 0)
                return BadRequest(new { message = "No file uploaded" });

            // Validate file type and size
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            var extension = Path.GetExtension(avatar.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { message = "Invalid file type. Only JPG, PNG, and GIF are allowed." });

            if (avatar.Length > 2 * 1024 * 1024) // 2MB
                return BadRequest(new { message = "File size exceeds 2MB limit" });

            try
            {
                // Create uploads directory if it doesn't exist
                var uploadsDir = Path.Combine(_environment.WebRootPath, "uploads", "avatars");
                if (!Directory.Exists(uploadsDir))
                    Directory.CreateDirectory(uploadsDir);

                // Generate unique filename
                var fileName = $"{userId}_{DateTime.Now:yyyyMMddHHmmss}{extension}";
                var filePath = Path.Combine(uploadsDir, fileName);

                // Save the file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await avatar.CopyToAsync(stream);
                }

                // Generate URL to access the file
                var avatarUrl = $"{Request.Scheme}://{Request.Host}/uploads/avatars/{fileName}";

                // Update user's avatar URL in database
                var user = await _context.Users.FindAsync(userId);
                if (user != null)
                {
                    user.ProfilePictureUrl = avatarUrl;
                    user.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }

                return Ok(new AvatarUploadResponse { AvatarUrl = avatarUrl });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading avatar");
                return StatusCode(500, new { message = "Error uploading avatar" });
            }
        }

        // GET: api/user/avatar
        [HttpGet("avatar")]
        public async Task<IActionResult> GetAvatarUrl()
        {
            if (!TryGetUserId(out int userId))
                return Unauthorized(new { message = "Invalid or missing User ID in token" });

            try
            {
                var user = await _context.Users
                    .Where(u => u.UserId == userId)
                    .Select(u => new { u.ProfilePictureUrl })
                    .FirstOrDefaultAsync();

                if (user == null)
                    return NotFound(new { message = "User not found" });

                return Ok(new { avatarUrl = user.ProfilePictureUrl });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting avatar URL");
                return StatusCode(500, new { message = "Error getting avatar URL" });
            }
        }


        private bool TryGetUserId(out int userId)
        {
            userId = 0;
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null && int.TryParse(userIdClaim.Value, out userId);
        }

        private bool VerifyPassword(string inputPassword, string storedHash)
        {
            // Your password verification logic
            return BCrypt.Net.BCrypt.Verify(inputPassword, storedHash);
        }

        private string HashPassword(string password)
        {
            // Your password hashing logic
            return BCrypt.Net.BCrypt.HashPassword(password);
        }
    }
}