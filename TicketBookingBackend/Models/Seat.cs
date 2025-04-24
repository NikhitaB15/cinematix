using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace TicketBookingBackend.Models;

public partial class Seat
{
    public int SeatId { get; set; }

    public int TheaterId { get; set; }

    public string SeatNumber { get; set; } = null!;

    public string SeatType { get; set; } = null!;

    public string? Status { get; set; }
    [JsonIgnore]
    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    [JsonIgnore]
    public virtual Theater Theater { get; set; } = null!;
}
