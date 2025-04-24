using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace TicketBookingBackend.Models;

public partial class User
{
    public int UserId { get; set; }

    public string FullName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string Role { get; set; } = null!;

    public string? PhoneNumber { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    // New settings-related properties
    public bool NotificationsEnabled { get; set; } = true;

    public bool DarkModeEnabled { get; set; } = false;

    public string? ProfilePictureUrl { get; set; }


    public DateTime? LastPasswordChangeDate { get; set; }

    public bool TwoFactorEnabled { get; set; } = false;

    // Existing navigation properties (preserved)
    [JsonIgnore]
    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    [JsonIgnore]
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    [JsonIgnore]
    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}