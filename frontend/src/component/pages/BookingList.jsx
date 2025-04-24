import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CalendarIcon, 
  TicketIcon, 
  ClockIcon, 
  MapPinIcon, 
  AlertCircle 
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const API_BASE_URL = "https://localhost:7060";

const BookingList = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/Bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to load bookings');
      }

      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const openCancelDialog = (bookingId) => {
    setBookingToCancel(bookingId);
    setCancelDialogOpen(true);
  };

  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/Bookings/${bookingToCancel}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to cancel booking');
      }

      // Get the updated booking and seat info from response
      const result = await response.json();
      
      // Refresh bookings list
      await fetchUserBookings();
      
      // If you need to update specific seat availability in other components,
      // you might want to emit an event or update a global state here
      alert('Booking cancelled successfully. Seat is now available again.');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setCancelDialogOpen(false);
      setBookingToCancel(null);
    }
};

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 pt-24 flex flex-col items-center justify-center min-h-64">
        <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-300 border-l-blue-300 border-r-blue-300 rounded-full animate-spin"></div>
        <p className="mt-4 text-lg font-medium text-gray-600">Loading your bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 pt-24">
        <Card className="border-red-200 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <h3 className="text-center text-lg font-semibold text-red-700 mb-2">Something went wrong</h3>
            <p className="text-center text-gray-600 mb-6">{error}</p>
            <div className="flex justify-center">
              <Button onClick={fetchUserBookings} className="bg-blue-600 hover:bg-blue-700">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-6 mt-16">
      {/* Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will cancel your booking and may be subject to cancellation fees.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelBooking}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirm Cancellation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Page title */}
      <div className="flex items-center gap-2 mb-6">
        <TicketIcon className="h-6 w-6 text-blue-500" />
        <h1 className="text-2xl font-bold">My Bookings</h1>
      </div>
      
      <Card className="shadow-lg border-t-4 border-t-blue-500">
        <CardContent className="p-6">
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <TicketIcon className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-lg text-gray-600 mb-6">You don't have any bookings yet.</p>
              <Button 
                onClick={() => navigate('/booking')}
                className="bg-blue-600 hover:bg-blue-700 px-6"
              >
                Book a Show
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <Card key={booking.bookingId} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className={`p-2 ${booking.status === 'Confirmed' ? 'bg-green-500' : 'bg-red-500'} text-white font-medium`}>
                    <div className="container flex items-center justify-between">
                      <span>{booking.status}</span>
                      <span className="text-xs opacity-75">Booking #{booking.bookingId}</span>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div className="space-y-4">
                        <h3 className="font-bold text-xl text-gray-800">{booking.show?.title || 'Show not available'}</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-500">Show Date & Time</p>
                              <p className="font-medium">{booking.show ? new Date(booking.show.showDateTime).toLocaleString() : 'N/A'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <MapPinIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-500">Seat Information</p>
                              <p className="font-medium">{booking.seat?.seatNumber || 'Not available'} ({booking.seat?.seatType || 'N/A'})</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-500">Booked on</p>
                            <p className="font-medium">{new Date(booking.bookingDate).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  {booking.status === 'Confirmed' && (
                    <CardFooter className="bg-gray-50 p-4 flex justify-end">
                      <Button 
                        variant="destructive" 
                        onClick={() => openCancelDialog(booking.bookingId)}
                        className="hover:bg-red-700 transition-colors"
                      >
                        Cancel Booking
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingList;