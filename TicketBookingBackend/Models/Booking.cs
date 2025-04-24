using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace TicketBookingBackend.Models;

public partial class Booking
{
    public int BookingId { get; set; }

    public int UserId { get; set; }

    public int ShowId { get; set; }

    public int SeatId { get; set; }

    public DateTime? BookingDate { get; set; }

    public string? Status { get; set; }
    [JsonIgnore]
    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
    [JsonIgnore]
    public virtual Seat Seat { get; set; } = null;
    [JsonIgnore]
    public virtual Show Show { get; set; } = null;
    [JsonIgnore]
    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    [JsonIgnore]
    public virtual User User { get; set; } = null;
}
