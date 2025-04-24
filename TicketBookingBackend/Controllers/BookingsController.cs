using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TicketBookingBackend.Models;

namespace TicketBookingBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BookingsController : ControllerBase
    {
        private readonly TicketBookingDatabaseContext _context;

        public BookingsController(TicketBookingDatabaseContext context)
        {
            _context = context;
        }

        // Helper to get the current user's ID from token
        private bool TryGetUserId(out int userId)
        {
            userId = 0;
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null && int.TryParse(userIdClaim.Value, out userId);
        }

        // Helper to get current IST time
        private DateTime GetCurrentIST()
        {
            try
            {
                TimeZoneInfo istZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
                return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, istZone);
            }
            catch (TimeZoneNotFoundException)
            {
                // Fallback for Linux systems
                TimeZoneInfo istZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Kolkata");
                return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, istZone);
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto bookingDto)
        {
            if (!TryGetUserId(out int userId))
                return Unauthorized(new { message = "Token does not contain a valid User ID" });

            // Create the booking entity from the DTO
            var booking = new Booking
            {
                ShowId = bookingDto.ShowId,
                SeatId = bookingDto.SeatId,
                UserId = userId,
                Status = "Confirmed",
                BookingDate = GetCurrentIST()
            };

            // Check seat availability
            bool isSeatTaken = await _context.Bookings
                .AnyAsync(b => b.ShowId == booking.ShowId &&
                              b.SeatId == booking.SeatId &&
                              b.Status != "Cancelled");

            if (isSeatTaken)
                return BadRequest(new { message = "Seat is already booked for this show" });

            // Validate show date is in future
            var show = await _context.Shows.FindAsync(booking.ShowId);
            if (show == null)
                return NotFound(new { message = "Show not found" });

            // Convert show time to IST for comparison
            var showDateTimeIST = TimeZoneInfo.ConvertTimeFromUtc(show.ShowDateTime, TimeZoneInfo.FindSystemTimeZoneById("India Standard Time"));
            if (showDateTimeIST <= GetCurrentIST())
                return BadRequest(new { message = "Cannot book for past shows" });

            // Update seat status to "Booked"
            var seat = await _context.Seats.FindAsync(booking.SeatId);
            if (seat != null)
            {
                seat.Status = "Booked";
                _context.Entry(seat).State = EntityState.Modified;
            }

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUserBookings), new { id = booking.BookingId }, new
            {
                booking.BookingId,
                BookingDate = booking.BookingDate,
                booking.Status,
                booking.ShowId,
                booking.SeatId
            });
        }

        [HttpGet("availability/{showId}/{seatId}")]
        public async Task<IActionResult> CheckSeatAvailability(int showId, int seatId)
        {
            bool isAvailable = !await _context.Bookings
                .AnyAsync(b => b.ShowId == showId &&
                              b.SeatId == seatId &&
                              b.Status != "Cancelled");

            return Ok(new { isAvailable });
        }

        // GET: api/bookings (Get bookings for the logged-in user)
        [HttpGet]
        public async Task<IActionResult> GetUserBookings()
        {
            if (!TryGetUserId(out int userId))
                return Unauthorized(new { message = "Token does not contain a valid User ID" });

            var bookings = await _context.Bookings
                .Include(b => b.Show)
                .Include(b => b.Seat)
                .Where(b => b.UserId == userId)
                .ToListAsync();

            // Map to a response that includes all needed details with IST times
            var bookingsResponse = bookings.Select(b => new
            {
                b.BookingId,
                BookingDate = b.BookingDate.HasValue ?
                    TimeZoneInfo.ConvertTimeFromUtc(b.BookingDate.Value, TimeZoneInfo.FindSystemTimeZoneById("India Standard Time")) :
                    (DateTime?)null,
                b.Status,
                b.ShowId,
                b.SeatId,
                Show = b.Show == null ? null : new
                {
                    b.Show.ShowId,
                    b.Show.Title,
                    ShowDateTime = TimeZoneInfo.ConvertTimeFromUtc(b.Show.ShowDateTime, TimeZoneInfo.FindSystemTimeZoneById("India Standard Time")),
                    b.Show.TicketPrice
                },
                Seat = b.Seat == null ? null : new
                {
                    b.Seat.SeatId,
                    b.Seat.SeatNumber,
                    b.Seat.SeatType
                }
            });

            return Ok(bookingsResponse);
        }

        // PUT: api/bookings/{id}/cancel (Allows a user to cancel their booking)
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelBooking(int id)
        {
            if (!TryGetUserId(out int userId))
                return Unauthorized(new { message = "Token does not contain a valid User ID" });

            var booking = await _context.Bookings
                .Include(b => b.Seat)
                .FirstOrDefaultAsync(b => b.BookingId == id && b.UserId == userId);

            if (booking == null)
                return NotFound(new { message = "Booking not found or not authorized" });

            // Update booking status
            booking.Status = "Cancelled";
            _context.Entry(booking).State = EntityState.Modified;

            // Update seat status back to "Available"
            if (booking.Seat != null)
            {
                booking.Seat.Status = "Available";
                _context.Entry(booking.Seat).State = EntityState.Modified;
            }

            await _context.SaveChangesAsync();

            // Return the updated seat information
            return Ok(new
            {
                BookingId = booking.BookingId,
                SeatId = booking.Seat?.SeatId,
                SeatStatus = booking.Seat?.Status
            });
        }
        public class CreateBookingDto
        {
            public int ShowId { get; set; }
            public int SeatId { get; set; }
        }
    }
}