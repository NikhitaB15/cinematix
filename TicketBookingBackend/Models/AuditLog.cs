using System;
using System.Collections.Generic;

namespace TicketBookingBackend.Models;

public partial class AuditLog
{
    public int LogId { get; set; }

    public int? UserId { get; set; }

    public string Action { get; set; } = null!;

    public DateTime? Timestamp { get; set; }

    public string? Details { get; set; }
}
