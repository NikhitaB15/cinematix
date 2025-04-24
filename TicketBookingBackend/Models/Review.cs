using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace TicketBookingBackend.Models;

public partial class Review
{
    public int ReviewId { get; set; }

    public int UserId { get; set; }

    public int ShowId { get; set; }

    public int? Rating { get; set; }

    public string? Comment { get; set; }

    public DateTime? CreatedAt { get; set; }
    [JsonIgnore]
    public virtual Show Show { get; set; } = null!;
    [JsonIgnore]
    public virtual User User { get; set; } = null!;
}
