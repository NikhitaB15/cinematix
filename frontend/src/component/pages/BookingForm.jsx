//require('dotenv').config();
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import axios from "axios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

const API_BASE_URL = "https://localhost:7060";

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [shows, setShows] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isLoadingShows, setIsLoadingShows] = useState(false);
  const [isLoadingSeats, setIsLoadingSeats] = useState(false);
  const [seatAvailability, setSeatAvailability] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("Razorpay");
  const [bookingError, setBookingError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay script when component mounts
useEffect(() => {
  const loadRazorpay = async () => {
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      console.log('Razorpay script loaded successfully');
      setRazorpayLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      setRazorpayLoaded(false);
    };
    document.body.appendChild(script);
  };

    loadRazorpay();
  }, []);

  // Get show title from URL query params
  useEffect(() => {
    
    const queryParams = new URLSearchParams(location.search);
    const showTitle = queryParams.get('title');
    
    if (showTitle) {
      fetchShows(showTitle);
    } else {
      fetchShows();
    }
  }, [location.search]);

  // Show alert message helper
  const showAlert = (message, isError = false) => {
    if (isError) {
      setBookingError(message);
    } else {
      alert(message);
      setBookingError(null);
    }
  };

  // Fetch shows with optional title filter
  const fetchShows = async (titleFilter = null) => {
    setIsLoadingShows(true);
    try {
      let url = `${API_BASE_URL}/api/shows`;
      if (titleFilter) {
        url += `?title=${encodeURIComponent(titleFilter)}`;
      }
  
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to load shows');
      }
  
      const data = await response.json();
      setShows(data);
  
      // If there's only one show returned from a title filter, select it automatically
      if (data.length === 1 && titleFilter) {
        setSelectedShow(data[0]);
      }
  
    } catch (error) {
      console.error('API Error:', error);
      showAlert(error.message || 'Failed to load shows', true);
    } finally {
      setIsLoadingShows(false);
    }
  };

  // Fetch seats when a show is selected
  useEffect(() => {
    const fetchSeats = async () => {
      if (selectedShow) {
        setIsLoadingSeats(true);
        setSeatAvailability({});  // Reset seat availability
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('No authentication token found');
          }
    
          // Fetch seats for the theater
          const seatsResponse = await fetch(
            `${API_BASE_URL}/api/seats/theater/${selectedShow.theaterId}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
    
          if (!seatsResponse.ok) {
            const errorText = await seatsResponse.text();
            throw new Error(`Failed to fetch seats: ${errorText}`);
          }
    
          const seatsData = await seatsResponse.json();
          setSeats(seatsData);
    
          // Check availability for each seat
          const availabilityPromises = seatsData.map(async (seat) => {
            try {
              const res = await fetch(
                `${API_BASE_URL}/api/bookings/availability/${selectedShow.showId}/${seat.seatId}`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                }
              );
              
              if (!res.ok) {
                console.error(`Error checking seat ${seat.seatId}:`, await res.text());
                return { seatId: seat.seatId, isAvailable: true }; // Assume available if check fails
              }
              
              const data = await res.json();
              return { seatId: seat.seatId, isAvailable: data.isAvailable };
            } catch (error) {
              console.error(`Error checking seat ${seat.seatId}:`, error);
              return { seatId: seat.seatId, isAvailable: true }; // Assume available if check fails
            }
          });
          
          const availabilityResults = await Promise.all(availabilityPromises);
          const availabilityMap = availabilityResults.reduce((acc, curr) => {
            acc[curr.seatId] = curr.isAvailable;
            return acc;
          }, {});
          
          setSeatAvailability(availabilityMap);
        } catch (error) {
          console.error('Error fetching seats:', error);
          showAlert(error.message || 'Failed to load seats', true);
          setSeats([]);
          setSeatAvailability({});
        } finally {
          setIsLoadingSeats(false);
        }
      }
    };

    fetchSeats();
  }, [selectedShow]);

  // Update seat status to "Booked"
  const updateSeatStatus = async (seatId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/seats/${seatId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify("Booked")
      });

      if (!response.ok) {
        console.warn('Failed to update seat status');
      }
    } catch (error) {
      console.error('Error updating seat status:', error);
    }
  };

  // Handle Razorpay payment
  const handleRazorpayPayment = async (bookingResult) => {
    if (!razorpayLoaded) {
      showAlert('Payment gateway is still loading. Please try again.', true);
      return;
    }

    setIsProcessingPayment(true);
    try {
      // 1. Create Razorpay order
      const orderResponse = await fetch(`${API_BASE_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          BookingId: bookingResult.bookingId,
          Amount: selectedShow.ticketPrice
        })
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create payment order');
      }

      const orderData = await orderResponse.json();

      // 2. Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        
        amount: orderData.Amount * 100, 
        currency: "INR",
        name: "Your Cinema",
        description: `Booking for ${selectedShow.title}`,
        order_id: orderData.OrderId,
        handler: async (response) => {
          try {
            // 3. Verify payment
            const verifyResponse = await fetch(`${API_BASE_URL}/api/payments/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                ...response,
                Amount: orderData.Amount,
                BookingId: bookingResult.bookingId
              })
            });

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            showAlert('Payment successful!');
            navigate('/bookings');
          } catch (error) {
            console.error('Payment verification error:', error);
            showAlert('Payment completed but verification failed. Please contact support.', true);
            navigate('/bookings');
          }
        },
        prefill: {
          name: localStorage.getItem("user"),
          email: localStorage.getItem("rememberedEmail"),
          contact: "7439638286"
        },
        theme: {
          color: "#3399cc"
        },
        modal: {
          ondismiss: () => {
            showAlert('Payment was cancelled', true);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Razorpay error:', error);
      showAlert(error.message || 'Payment processing failed', true);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Handle booking submission
  const handleBooking = async () => {
    if (!selectedShow || !selectedSeat) {
      showAlert('Please select a show and a seat', true);
      return;
    }

    try {
      setBookingError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Double-check seat availability
      const availabilityResponse = await fetch(
        `${API_BASE_URL}/api/bookings/availability/${selectedShow.showId}/${selectedSeat.seatId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!availabilityResponse.ok) {
        const errorText = await availabilityResponse.text();
        throw new Error(errorText || 'Failed to check seat availability');
      }

      const { isAvailable } = await availabilityResponse.json();
      if (!isAvailable) {
        showAlert('Selected seat is no longer available. Please choose another seat.', true);
        
        // Update seat availability in the state
        setSeatAvailability(prev => ({
          ...prev,
          [selectedSeat.seatId]: false
        }));
        
        setSelectedSeat(null);
        setDialogOpen(false);
        return;
      }

      setIsBooking(true);
      
      // Create booking
      const bookingResponse = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          showId: selectedShow.showId,
          seatId: selectedSeat.seatId
        })
      });
      
      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Booking failed');
      }

      const bookingResult = await bookingResponse.json();
      
      // Update seat status to "Booked"
      await updateSeatStatus(selectedSeat.seatId);
      
      // Update local state to reflect the booked seat
      setSeatAvailability(prev => ({
        ...prev,
        [selectedSeat.seatId]: false
      }));

      // Handle payment based on selected method
      if (paymentMethod === "Razorpay") {
        await handleRazorpayPayment(bookingResult);
      } else {
        showAlert('Booking successful!');
        navigate('/bookings');
      }
      
    } catch (error) {
      console.error('Booking error:', error);
      showAlert(error.message || 'Booking failed', true);
      setDialogOpen(false);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedShow 
              ? `Book Your Seat for: ${selectedShow.title}`
              : 'Select a Show to Book'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Display booking errors */}
          {bookingError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{bookingError}</AlertDescription>
            </Alert>
          )}

          {/* Loading state for shows */}
          {isLoadingShows && (
            <div className="p-4 text-center">Loading shows...</div>
          )}

          {/* Show Selection - Only show if no preselected show */}
          {!selectedShow && !isLoadingShows && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Show</label>
              <Select onValueChange={(value) => {
                const show = shows.find(s => s.showId === parseInt(value));
                setSelectedShow(show);
                setSelectedSeat(null); // Reset selected seat when show changes
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a show" />
                </SelectTrigger>
                <SelectContent>
                  {shows.map(show => (
                    <SelectItem key={show.showId} value={show.showId.toString()}>
                      {show.title} - {new Date(show.showDateTime).toLocaleString()} (${show.ticketPrice.toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Show Info if preselected */}
          {selectedShow && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-bold">{selectedShow.title}</h3>
              <p>Date: {new Date(selectedShow.showDateTime).toLocaleString()}</p>
              <p>Price: ${selectedShow.ticketPrice.toFixed(2)}</p>
            </div>
          )}

          {/* Seat Selection */}
          {selectedShow && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Seat</label>
              {isLoadingSeats ? (
                <div className="p-4 text-center">Loading seats...</div>
              ) : seats.length === 0 ? (
                <div className="p-4 text-center">No seats available for this theater</div>
              ) : (
                <div className="grid grid-cols-5 gap-2">
                  {seats.map(seat => {
                    // Check if we have availability info for this seat
                    const isAvailable = seatAvailability[seat.seatId] !== false;
                    const isSelected = selectedSeat?.seatId === seat.seatId;
                    
                    return (
                      <Button
                        key={seat.seatId}
                        variant={
                          !isAvailable 
                            ? "destructive" 
                            : isSelected 
                              ? "default" 
                              : "outline"
                        }
                        className={
                          !isAvailable 
                            ? "opacity-50 cursor-not-allowed" 
                            : "cursor-pointer"
                        }
                        onClick={() => {
                          if (isAvailable) {
                            setSelectedSeat(seat);
                          }
                        }}
                        disabled={!isAvailable || isBooking}
                      >
                        {seat.seatNumber}
                        {!isAvailable && " (Booked)"}
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Payment Method Selection */}
          {selectedShow && selectedSeat && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Payment Method</label>
              <Select 
                value={paymentMethod} 
                onValueChange={setPaymentMethod}
                disabled={isBooking || isProcessingPayment}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Razorpay">Razorpay (UPI/Cards/NetBanking)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Booking Summary and Payment */}
          {selectedShow && selectedSeat && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="w-full" 
                  disabled={isBooking || isProcessingPayment}
                  onClick={() => setDialogOpen(true)}
                >
                  {isBooking ? 'Processing...' : 'Proceed to Booking'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Booking Confirmation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p><strong>Show:</strong> {selectedShow.title}</p>
                  <p><strong>Date:</strong> {new Date(selectedShow.showDateTime).toLocaleString()}</p>
                  <p><strong>Seat:</strong> {selectedSeat.seatNumber}</p>
                  <p><strong>Price:</strong> ${selectedShow.ticketPrice.toFixed(2)}</p>
                  <p><strong>Payment Method:</strong> {paymentMethod}</p>
                  <Button 
                    onClick={handleBooking} 
                    className="w-full"
                    disabled={isBooking || isProcessingPayment}
                  >
                    {isProcessingPayment ? 'Processing Payment...' : isBooking ? 'Creating Booking...' : 'Confirm Booking'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingPage;