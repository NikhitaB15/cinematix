using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TicketBookingBackend.Models;

namespace TicketBookingApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    
    public class ReviewsController : ControllerBase
    {
        private readonly TicketBookingDatabaseContext _context;

        public ReviewsController(TicketBookingDatabaseContext context)
        {
            _context = context;
        }

        // GET: api/reviews/{showId}
        // Get all reviews for a specific show.
        [HttpGet("{showId}")]
        public async Task<IActionResult> GetReviews(int showId)
        {
            var reviews = await _context.Reviews
                .Where(r => r.ShowId == showId)
                .ToListAsync();
            return Ok(reviews);
        }

        // POST: api/reviews
        // Create a new review.
        [HttpPost]
        public async Task<IActionResult> CreateReview([FromBody] Review review)
        {
            review.UserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            review.CreatedAt = DateTime.UtcNow;
            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();
            return Ok(review);
        }
    }
}
