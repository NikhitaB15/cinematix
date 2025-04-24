import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom"; 
import { 
  faStar, 
  faTicket, 
  faFilm, 
  faCalendar, 
  faFireAlt,
  faComment,
  faUser,
  faTimes
} from "@fortawesome/free-solid-svg-icons";

// API Endpoints
const BASE_URL = 'https://localhost:7060/api/';
const SHOWS_API_URL = `${BASE_URL}shows`;
const REVIEWS_API_URL = `${BASE_URL}reviews`;

const Home = () => {
  const [heroIndex, setHeroIndex] = useState(0);
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Now Playing");
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  // Movie categories
  const categories = [
    "Now Playing", 
    "Coming Soon", 
    "Top Rated", 
    "Trending"
  ];

  // Fetch shows and initialize with default review data
  const fetchShows = async () => {
    try {
      setLoading(true);
      const response = await axios.get(SHOWS_API_URL);
      
      // Process shows data with default review values
      const transformedMovies = response.data.map(show => ({
        id: show.showId,
        title: show.title,
        description: show.description,
        imageUrl: show.imageUrl,
        status: new Date(show.showDateTime) > new Date() ? "Coming Soon" : "Now Playing",
        releaseDate: new Date(show.showDateTime).toLocaleDateString(),
        trending: Math.random() > 0.5,
        rating: Math.floor(Math.random() * 5) + 1, // Default rating
        reviewCount: 0, // Will be updated after fetching reviews
        featuredReview: null,
        reviews: [] // Initialize empty reviews array
      }));

      // Fetch reviews for each movie and update the data
      const moviesWithReviews = await Promise.all(
        transformedMovies.map(async movie => {
          try {
            const reviews = await fetchMovieReviews(movie.id);
            const avgRating = reviews.length > 0 
              ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
              : movie.rating;
            
            return {
              ...movie,
              rating: avgRating,
              reviewCount: reviews.length,
              featuredReview: reviews.length > 0 ? reviews[0].comment : null,
              reviews
            };
          } catch (error) {
            console.error(`Error fetching reviews for movie ${movie.id}:`, error);
            return movie; // Return movie with default values if reviews fetch fails
          }
        })
      );

      setMovies(moviesWithReviews);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching shows:", error);
      setLoading(false);
    }
  };

  // Fetch reviews for a specific movie
  const fetchMovieReviews = async (movieId) => {
    try {
      //console.log("the movie id is...............",movieId);
      const response = await axios.get(`${REVIEWS_API_URL}/${movieId}`,);
      return response.data;
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }
  };

  // Open reviews modal
  const openReviewsModal = async (movie) => {
    try {
      // Check if we already have reviews for this movie
      if (!movie.reviews || movie.reviews.length === 0) {
        const reviews = await fetchMovieReviews(movie.id);
        setSelectedMovie({
          ...movie,
          reviews,
          reviewCount: reviews.length
        });
      } else {
        setSelectedMovie(movie);
      }
      setShowReviewsModal(true);
    } catch (error) {
      console.error("Error opening reviews modal:", error);
    }
  };

  // Auto-rotate hero section
  useEffect(() => {
    if (movies.length > 0) {
      const interval = setInterval(() => {
        setHeroIndex((prevIndex) => (prevIndex + 1) % movies.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [movies]);

  // Fetch data on component mount
  useEffect(() => {
    fetchShows();
  }, []);

  const handleBookTicket = (movie) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in to book a ticket.");
      return;
    }

    navigate(`/booking/${movie.id}?title=${encodeURIComponent(movie.title)}`);
  };

  // Filter movies based on active category
  const filteredMovies = movies.filter(movie => {
    switch(activeCategory) {
      case "Now Playing":
        return movie.status === "Now Playing";
      case "Coming Soon":
        return movie.status === "Coming Soon";
      case "Top Rated":
        return movie.rating >= 4;
      case "Trending":
        return movie.trending;
      default:
        return true;
    }
  });

  // Reviews Modal Component
  const ReviewsModal = () => {
    if (!selectedMovie) return null;

    return (
      <motion.div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
        >
          <button 
            onClick={() => setShowReviewsModal(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
          
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedMovie.title}</h2>
                <div className="flex items-center">
                  <div className="flex mr-2">
                    {[...Array(5)].map((_, i) => (
                      <FontAwesomeIcon 
                        key={i}
                        icon={faStar} 
                        className={`text-lg ${i < Math.floor(selectedMovie.rating) ? 'text-yellow-400' : 'text-gray-600'}`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-400">({selectedMovie.reviewCount} reviews)</span>
                </div>
              </div>
              <span className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm">
                {selectedMovie.status}
              </span>
            </div>
            
            <div className="space-y-6">
              {selectedMovie.reviews?.length > 0 ? (
                selectedMovie.reviews.map((review) => (
                  <div key={review.reviewId || review.id} className="border-b border-gray-700 pb-6 last:border-0">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                          <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                        </div>
                        <span className="font-medium">User {review.userId}</span>
                      </div>
                      <div className="flex items-center text-yellow-400">
                        <FontAwesomeIcon icon={faStar} className="mr-1" />
                        <span>{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-300">{review.comment}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No reviews yet. Be the first to review!
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white">
      {/* Hero Section */}
      <div className="relative h-[600px] md:h-screen max-h-[800px] overflow-hidden">
        <AnimatePresence mode="wait">
          {movies.length > 0 ? (
            <motion.div
              key={heroIndex}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Blurred Background */}
              <div
  className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-30"
  style={{ backgroundImage: `url(${movies[heroIndex].imageUrl})` }}
/>


              {/* Overlay Gradient */}
              

              {/* Content */}
              <div className="relative z-10 container mx-auto px-6 md:px-16 lg:px-24 h-full flex items-center">
                <div className="max-w-2xl">
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="flex items-center mb-4">
                      <span className="bg-gradient-to-r from-pink-600 to-pink-800 text-white px-3 py-1 rounded-full mr-4 text-sm flex items-center shadow-lg shadow-red-900/30">
                        <FontAwesomeIcon icon={faFireAlt} className="mr-2" />
                        {movies[heroIndex]?.trending ? "Trending" : "Featured"}
                      </span>
                      <div className="flex items-center text-yellow-400">
                        <FontAwesomeIcon icon={faStar} className="mr-2" />
                        <span className="font-bold">{movies[heroIndex]?.rating?.toFixed(1) || "N/A"}</span>
                      </div>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                      {movies[heroIndex]?.title}
                    </h1>

                    <p className="text-gray-300 text-lg mb-8 line-clamp-3">
                      {movies[heroIndex]?.description || "An exciting new movie experience awaits!"}
                    </p>
                    
                    <div className="flex items-center mt-4 text-gray-300 mb-6">
                      <div className="flex items-center mr-6 cursor-pointer hover:text-white"
                           onClick={() => openReviewsModal(movies[heroIndex])}>
                        <FontAwesomeIcon icon={faStar} className="text-yellow-400 mr-1" />
                        <span className="font-medium">{movies[heroIndex]?.rating?.toFixed(1) || 0}/5</span>
                        <span className="mx-2">•</span>
                        <span>{movies[heroIndex]?.reviewCount || 0} reviews</span>
                      </div>
                      {movies[heroIndex]?.featuredReview && (
                        <div className="border-l border-gray-600 pl-4 cursor-pointer hover:text-white"
                             onClick={() => openReviewsModal(movies[heroIndex])}>
                          <p className="text-sm italic line-clamp-1">"{movies[heroIndex].featuredReview}"</p>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-4">
                      <motion.button
                        className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg flex items-center shadow-lg shadow-red-900/30"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleBookTicket(movies[heroIndex])}
                      >
                        <FontAwesomeIcon icon={faTicket} className="mr-2" />
                        Book Tickets
                      </motion.button>
                      <motion.button
                        className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg flex items-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openReviewsModal(movies[heroIndex])}
                      >
                        <FontAwesomeIcon icon={faComment} className="mr-2" />
                        See Reviews
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex justify-center items-center h-full">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 bg-gray-700 rounded-full mb-4"></div>
                <p className="text-gray-400 text-xl">Loading movies...</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Movie Categories and Listings */}
      <div className="container mx-auto px-6 md:px-16 lg:px-24 py-12">
        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <motion.button
              key={category}
              className={`
                px-6 py-2 rounded-full transition-all duration-300 flex items-center
                ${activeCategory === category 
                  ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-900/30' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }
              `}
              onClick={() => setActiveCategory(category)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category === "Now Playing" && <FontAwesomeIcon icon={faFilm} className="mr-2" />}
              {category === "Coming Soon" && <FontAwesomeIcon icon={faCalendar} className="mr-2" />}
              {category === "Top Rated" && <FontAwesomeIcon icon={faStar} className="mr-2" />}
              {category === "Trending" && <FontAwesomeIcon icon={faFireAlt} className="mr-2" />}
              {category}
            </motion.button>
          ))}
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="bg-gray-800 rounded-xl overflow-hidden shadow-lg animate-pulse">
                <div className="w-full h-96 bg-gray-700"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-700 rounded mb-3 w-3/4"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-700 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Movie Grid */}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {filteredMovies.map((movie) => (
              <motion.div 
                key={movie.id}
                className="bg-gray-800 rounded-xl overflow-hidden shadow-lg group hover:shadow-xl hover:shadow-red-900/20 transition-all duration-300 border border-gray-700 hover:border-gray-600"
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div className="relative">
                  <img 
                    src={movie.imageUrl} 
                    alt={movie.title} 
                    className="w-full h-96 object-cover group-hover:opacity-90 transition-opacity duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-4 right-4 bg-gradient-to-br from-yellow-500 to-yellow-600 text-black px-2 py-1 rounded-full flex items-center shadow-md">
                    <FontAwesomeIcon icon={faStar} className="mr-1 text-xs" />
                    <span className="font-bold text-sm">{movie.rating?.toFixed(1)}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 truncate">{movie.title}</h3>
                  
                  {/* Review Summary */}
                  <div className="flex items-center mb-3 cursor-pointer" onClick={() => openReviewsModal(movie)}>
                    <div className="flex mr-2">
                      {[...Array(5)].map((_, i) => (
                        <FontAwesomeIcon 
                          key={i}
                          icon={faStar} 
                          className={`text-xs ${i < Math.floor(movie.rating) ? 'text-yellow-400' : 'text-gray-600'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">({movie.reviewCount})</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400 flex items-center">
                      <FontAwesomeIcon icon={faCalendar} className="mr-2 text-gray-500" />
                      {movie.releaseDate}
                    </span>
                    <div className="flex space-x-2">
                      <motion.button 
                        className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-3 py-1 rounded-lg text-xs shadow-md shadow-red-900/20"
                        onClick={() => handleBookTicket(movie)}
                        whileTap={{ scale: 0.95 }}
                      >
                        Book
                      </motion.button>
                      <motion.button 
                        className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-xs"
                        onClick={() => openReviewsModal(movie)}
                        whileTap={{ scale: 0.95 }}
                      >
                        Reviews
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredMovies.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="bg-gray-800 p-6 rounded-full mb-4">
              <FontAwesomeIcon icon={faFilm} className="text-4xl text-gray-500" />
            </div>
            <h3 className="text-xl font-medium text-gray-300 mb-2">No movies found</h3>
            <p className="text-gray-500 text-center max-w-md">
              There are currently no movies in the {activeCategory.toLowerCase()} category.
              Check back later!
            </p>
          </div>
        )}
      </div>

      {/* Reviews Modal */}
      <AnimatePresence>
        {showReviewsModal && <ReviewsModal />}
      </AnimatePresence>
    </div>
  );
};

export default Home;