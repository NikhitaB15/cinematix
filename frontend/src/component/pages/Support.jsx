import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const SupportPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    try {
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Cinematix Support</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Contact Our Support Team</CardTitle>
          </CardHeader>
          <CardContent>
            {submitSuccess ? (
              <div className="p-4 bg-green-100 text-green-800 rounded-lg">
                Thank you for contacting us! We'll get back to you within 24 hours.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Name
                  </label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    required
                  />
                </div>
                
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* FAQ and Contact Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">How do I book tickets?</h3>
                <p className="text-sm text-gray-600">
                  Select a show, choose your seats, and proceed to payment. You'll receive confirmation via email.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">Can I cancel my booking?</h3>
                <p className="text-sm text-gray-600">
                  Yes, bookings can be cancelled up to 2 hours before the show. Visit "My Bookings" to cancel.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">What payment methods are accepted?</h3>
                <p className="text-sm text-gray-600">
                  We accept credit/debit cards, PayPal, and select mobile payment options.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-sm text-gray-600">support@cinematix.com</p>
              </div>
              
              <div>
                <h3 className="font-medium">Phone</h3>
                <p className="text-sm text-gray-600">+1 (800) 123-4567</p>
              </div>
              
              <div>
                <h3 className="font-medium">Hours</h3>
                <p className="text-sm text-gray-600">9AM - 9PM, 7 days a week</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Emergency Support */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-yellow-800">Urgent Show Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <p className="text-yellow-800">
              For urgent issues with ongoing shows (technical problems, seating issues, etc.), 
              please call our immediate support line:
            </p>
            <Button variant="outline" className="bg-yellow-100 border-yellow-300 text-yellow-800">
              +1 (800) 987-6543
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportPage;