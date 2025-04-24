using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace TicketBookingBackend.Models;

public partial class Theater
{
    public int TheaterId { get; set; }

    public string Name { get; set; } = null!;

    public string Location { get; set; } = null!;

    public int TotalSeats { get; set; }
    [JsonIgnore]
    public virtual ICollection<Seat> Seats { get; set; } = new List<Seat>();
    [JsonIgnore]
    public virtual ICollection<Show> Shows { get; set; } = new List<Show>();
}
