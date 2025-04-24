using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading.Tasks;
using TicketBookingBackend.Models;

namespace TicketBookingApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ShowsController : ControllerBase
    {
        private readonly TicketBookingDatabaseContext _context;
        private readonly ILogger<ShowsController> _logger;

        public ShowsController(
            TicketBookingDatabaseContext context,
            ILogger<ShowsController> logger)
        {
            _context = context;
            _logger = logger;
        }
        // Get all shows with optional title filtering
       
        [HttpGet]
        public async Task<IActionResult> GetShows([FromQuery] string title = null)
        {
            try
            {
                var query = _context.Shows.AsNoTracking().AsQueryable();

                if (!string.IsNullOrWhiteSpace(title))
                {
                    query = query.Where(s => s.Title.Contains(title));
                    _logger.LogInformation($"Filtering shows by title: {title}");
                }

                var shows = await query
                    .Select(s => new
                    {
                        s.ShowId,
                        s.Title,
                        s.Description,
                        s.ShowDateTime,
                        s.Duration,
                        s.TicketPrice,
                        s.TheaterId,
                        s.ImageUrl
                    })
                    .ToListAsync();

                return Ok(shows);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting shows");
                return StatusCode(500, new { message = "An error occurred while processing your request." });
            }
        }

        /// <summary>
        /// Get a specific show by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetShow(int id)
        {
            try
            {
                var show = await _context.Shows
                    .AsNoTracking()
                    .FirstOrDefaultAsync(s => s.ShowId == id);

                if (show == null)
                {
                    _logger.LogWarning($"Show with ID {id} not found");
                    return NotFound(new { message = "Show not found." });
                }

                return Ok(show);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error occurred while getting show with ID {id}");
                return StatusCode(500, new { message = "An error occurred while processing your request." });
            }
        }

        /// <summary>
        /// Create a new show (Admin only)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateShow([FromBody] Show show)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state for creating show");
                    return BadRequest(ModelState);
                }

                _context.Shows.Add(show);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Created new show with ID {show.ShowId}");
                return CreatedAtAction(nameof(GetShow), new { id = show.ShowId }, show);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating show");
                return StatusCode(500, new { message = "An error occurred while creating the show." });
            }
        }

        /// <summary>
        /// Update an existing show (Admin only)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateShow(int id, [FromBody] Show show)
        {
            try
            {
                if (id != show.ShowId)
                {
                    _logger.LogWarning($"Show ID mismatch: {id} vs {show.ShowId}");
                    return BadRequest(new { message = "Show ID mismatch." });
                }

                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state for updating show");
                    return BadRequest(ModelState);
                }

                _context.Entry(show).State = EntityState.Modified;

                try
                {
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"Updated show with ID {id}");
                }
                catch (DbUpdateConcurrencyException ex)
                {
                    if (!ShowExists(id))
                    {
                        _logger.LogWarning($"Show with ID {id} not found for update");
                        return NotFound(new { message = "Show not found." });
                    }
                    _logger.LogError(ex, $"Concurrency error updating show with ID {id}");
                    throw;
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error occurred while updating show with ID {id}");
                return StatusCode(500, new { message = "An error occurred while updating the show." });
            }
        }

        /// <summary>
        /// Cancel a booking and update seat status to Available (Admin only)
        /// </summary>
        [HttpPost("cancel-booking/{bookingId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CancelBooking(int bookingId)
        {
            try
            {
                // Find the booking including its associated seat
                var booking = await _context.Bookings
                    .Include(b => b.Seat)  // Include the Seat navigation property
                    .FirstOrDefaultAsync(b => b.BookingId == bookingId);

                if (booking == null)
                {
                    _logger.LogWarning($"Booking with ID {bookingId} not found");
                    return NotFound(new { message = "Booking not found." });
                }

                // Update the seat's status to Available
                if (booking.Seat != null)
                {
                    booking.Seat.Status = "Available";
                    _context.Entry(booking.Seat).State = EntityState.Modified;
                }

                // Remove the booking
                _context.Bookings.Remove(booking);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Cancelled booking with ID {bookingId} and freed seat {booking.SeatId}");
                return Ok(new { message = "Booking cancelled successfully and seat made available." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error occurred while cancelling booking with ID {bookingId}");
                return StatusCode(500, new { message = "An error occurred while cancelling the booking." });
            }
        }
        /// Delete a show (Admin only)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteShow(int id)
        {
            try
            {
                var show = await _context.Shows.FindAsync(id);
                if (show == null)
                {
                    _logger.LogWarning($"Show with ID {id} not found for deletion");
                    return NotFound(new { message = "Show not found." });
                }

                _context.Shows.Remove(show);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Deleted show with ID {id}");
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error occurred while deleting show with ID {id}");
                return StatusCode(500, new { message = "An error occurred while deleting the show." });
            }
        }

        private bool ShowExists(int id)
        {
            return _context.Shows.Any(e => e.ShowId == id);
        }
    }
}