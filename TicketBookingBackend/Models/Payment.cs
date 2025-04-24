using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace TicketBookingBackend.Models;

public partial class Payment
{
    public int PaymentId { get; set; }

    public int BookingId { get; set; }

    public string PaymentMethod { get; set; } = null!;

    public string? PaymentStatus { get; set; }

    public decimal AmountPaid { get; set; }

    public string TransactionId { get; set; } = null!;
    public string? RazorpayOrderId { get; set; }
    public string? RazorpayPaymentId { get; set; }
    public string? RazorpaySignature { get; set; }
    public DateTime? PaymentDate { get; set; }
    [JsonIgnore]
    public virtual Booking Booking { get; set; } = null!;
}
