import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useTheme } from '../../context/ThemeContext'

const API_BASE_URL = 'https://localhost:7060/api';

const SettingsPage = () => {
    
  const { isDarkMode, toggleDarkMode } = useTheme();
  const fileInputRef = useRef(null);
  
  // Add these state variables
  const [userSettings, setUserSettings] = useState({
    name: '',
    email: '',
    phone: '',
    notificationsEnabled: true,
    avatarUrl: ''
  });
  
  const [name, setName] = useState('Nikhita Bhattacharya');
  const [email, setEmail] = useState('nikhitabhatt153@gmail.com');
  const [phone, setPhone] = useState('+91 7439638286');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  // Add this useEffect to load settings on component mount
  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/user/settings`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        },);
        if (!response.ok) {
          throw new Error('Failed to fetch user settings');
        }
        const data = await response.json();
        console.log(data);
        setUserSettings(data);
        setName(data.name);
        setEmail(data.email);
        setPhone(data.phone);
        setNotificationsEnabled(data.notificationsEnabled);
        setAvatarUrl(data.avatarUrl || '');
        
        // Store avatar URL in localStorage for access in Navbar
        if (data.avatarUrl) {
          localStorage.setItem('userAvatar', data.avatarUrl);
        }
        
      } catch (error) {
        console.error('Error fetching user settings:', error);
      }
    };
    fetchUserSettings();
  }, []);

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return null;
    
    const formData = new FormData();
    
    formData.append('avatar', avatarFile);
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }
      
      const data = await response.json();
      
      localStorage.setItem('userAvatar', data.avatarUrl);
      return data.avatarUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
    
  };

  // Update the handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Upload avatar if a new one was selected
    let newAvatarUrl = avatarUrl;
    if (avatarFile) {
      const uploadedUrl = await uploadAvatar();
      if (uploadedUrl) {
        newAvatarUrl = uploadedUrl;
      }
    }
    
    try {
      const response = await fetch(`https://localhost:7060/api/user/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          notificationsEnabled,
          darkMode: isDarkMode,
          profilePictureUrl:newAvatarUrl
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save settings');
      }
      
      setAvatarUrl(newAvatarUrl);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(error.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Add password change handler
  const handlePasswordChange = async (currentPassword, newPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/settings/password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }
      alert('Password changed successfully');
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      alert(error.message || 'Failed to change password');
      return false;
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Settings</h1>
        {saveSuccess && (
          <span className="text-sm text-green-600">Settings saved successfully!</span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={avatarPreview || avatarUrl || "https://github.com/shadcn.png"} />
                  <AvatarFallback>{name ? name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <Button variant="outline" size="sm" onClick={handleAvatarClick}>
                    Change Avatar
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    JPG, GIF or PNG. Max size 2MB
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preferences */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about bookings and promotions
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark theme
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={isDarkMode}
                  onCheckedChange={toggleDarkMode}
                  
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Password</Label>
                <Button 
                  variant="outline" 
                  className="w-full mt-2" 
                  onClick={() => {
                    // Simple implementation - in production you'd use a modal
                    const currentPassword = prompt("Enter current password");
                    const newPassword = prompt("Enter new password");
                    if (currentPassword && newPassword) {
                      handlePasswordChange(currentPassword, newPassword);
                    }
                  }}
                >
                  Change Password
                </Button>
              </div>

              <Separator />

              <div>
                <Label>Two-Factor Authentication</Label>
                <Button variant="outline" className="w-full mt-2">
                  Enable 2FA
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Delete Account</Label>
                <p className="text-sm text-muted-foreground">
                  Permanently remove your account and all associated data
                </p>
                <Button variant="destructive" className="mt-2">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;