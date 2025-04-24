using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TicketBookingBackend.Models;

namespace TicketBookingBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SeatsController : ControllerBase
    {
        private readonly TicketBookingDatabaseContext _context;

        public SeatsController(TicketBookingDatabaseContext context)
        {
            _context = context;
        }

        // GET: api/seats
        [HttpGet]
        public async Task<IActionResult> GetSeats()
        {
            var seats = await _context.Seats.ToListAsync();
            return Ok(seats);
        }

        // GET: api/seats/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetSeat(int id)
        {
            var seat = await _context.Seats.FindAsync(id);
            if (seat == null)
                return NotFound(new { message = "Seat not found." });
            return Ok(seat);
        }

        // GET: api/seats/theater/3 (Get all seats for a specific theater)
       
        [HttpGet("theater/{theaterId}")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> GetSeatsByTheater(int theaterId)
        {
            var seats = await _context.Seats.Where(s => s.TheaterId == theaterId).ToListAsync();
            return Ok(seats);
        }

        // POST: api/seats
        // Admin-only endpoint for adding a seat.
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateSeat([FromBody] Seat seat)
        {
            _context.Seats.Add(seat);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetSeat), new { id = seat.SeatId }, seat);
        }
        // PUT: api/seats/5/status
        [HttpPut("{id}/status")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> UpdateSeatStatus(int id, [FromBody] string status)
        {
            var seat = await _context.Seats.FindAsync(id);
            if (seat == null)
                return NotFound(new { message = "Seat not found." });

            seat.Status = status;
            _context.Entry(seat).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SeatExists(id))
                    return NotFound(new { message = "Seat not found." });
                else
                    throw;
            }

            return NoContent();
        }
        // PUT: api/seats/5
        // Admin-only endpoint for updating seat details.
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateSeat(int id, [FromBody] Seat seat)
        {
            if (id != seat.SeatId)
                return BadRequest(new { message = "Seat ID mismatch." });

            _context.Entry(seat).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SeatExists(id))
                    return NotFound(new { message = "Seat not found." });
                else
                    throw;
            }
            return NoContent();
        }

        // DELETE: api/seats/5
        // Admin-only endpoint for deleting a seat.
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteSeat(int id)
        {
            var seat = await _context.Seats.FindAsync(id);
            if (seat == null)
                return NotFound(new { message = "Seat not found." });

            _context.Seats.Remove(seat);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool SeatExists(int id)
        {
            return _context.Seats.Any(s => s.SeatId == id);
        }
    }
}
