using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Razorpay.Api;
using System.Security.Claims;
using TicketBookingBackend.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using TicketBookingApp.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly TicketBookingDatabaseContext _context;
    private readonly RazorpayClient _razorpayClient;
    private readonly ILogger<ShowsController> _logger;

    public PaymentsController(TicketBookingDatabaseContext context, IConfiguration config)
    {
        _context = context;
        _razorpayClient = new RazorpayClient(
            config["Razorpay:KeyId"],
            config["Razorpay:KeySecret"]
        );
    }

    // Create Razorpay Order
    [HttpPost("create-order")]
    public async Task<IActionResult> CreateRazorpayOrder([FromBody] RazorpayOrderRequest request)
    {
        if (!TryGetUserId(out int userId))
            return Unauthorized();

        try
        {
            var booking = await _context.Bookings.FindAsync(request.BookingId);
            if (booking == null || booking.UserId != userId)
                return BadRequest("Invalid booking");

            var options = new Dictionary<string, object>
        {
            { "amount", (int)(request.Amount * 100) }, // Razorpay uses paise
            { "currency", "INR" },
            { "receipt", $"order_{request.BookingId}" },
            { "notes", new Dictionary<string, string> {
                { "bookingId", request.BookingId.ToString() }
            }}
        };

            var order = _razorpayClient.Order.Create(options);
            return Ok(new
            {
                OrderId = order["id"],
                Amount = request.Amount
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating Razorpay order");
            return StatusCode(500, "Error creating payment order");
        }
    }

    // Verify Payment
    [HttpPost("verify")]
    public async Task<IActionResult> VerifyPayment([FromBody] RazorpayPaymentResponse response)
    {
        try
        {
            var attributes = new Dictionary<string, string>
        {
            { "razorpay_payment_id", response.PaymentId },
            { "razorpay_order_id", response.OrderId },
            { "razorpay_signature", response.Signature }
        };

            
            Utils.verifyPaymentLinkSignature(attributes);

            // Save payment to database
            var payment = new TicketBookingBackend.Models.Payment
            {
                BookingId = response.BookingId,
                PaymentMethod = "Razorpay",
                AmountPaid = response.Amount,
                TransactionId = response.PaymentId,
                PaymentStatus = "Completed",
                PaymentDate = DateTime.UtcNow
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Payment verification failed");
            return BadRequest(new { error = "Payment verification failed" });
        }
    }

    private bool TryGetUserId(out int userId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        return int.TryParse(userIdClaim?.Value, out userId);
    }

    public class RazorpayOrderRequest
    {
        public int BookingId { get; set; }
        public decimal Amount { get; set; }
    }

    public class RazorpayPaymentResponse
    {
        public string PaymentId { get; set; }
        public string OrderId { get; set; }
        public string Signature { get; set; }
        public decimal Amount { get; set; }
        public int BookingId { get; set; }
    }
}

