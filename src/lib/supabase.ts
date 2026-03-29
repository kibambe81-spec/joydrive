import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please check your .env file.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// ==================== Authentication ====================

// Sign in with Google
export async function signInWithGoogle() {
  const redirectUrl = `${window.location.origin}`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  if (error) console.error('Google sign-in error:', error.message);
  return { data, error };
}

// Sign in with Facebook
export async function signInWithFacebook() {
  const redirectUrl = `${window.location.origin}`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: redirectUrl,
    },
  });
  if (error) console.error('Facebook sign-in error:', error.message);
  return { data, error };
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Sign out error:', error.message);
  return error;
}

// Delete user account
export async function deleteUserAccount(userId: string) {
  try {
    // Delete profile first (cascades to rides, messages, calls, notifications)
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (profileError) {
      console.error('Profile deletion error:', profileError.message);
      return profileError;
    }

    // Delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) {
      console.error('Auth deletion error:', authError.message);
      return authError;
    }

    return null;
  } catch (error) {
    console.error('Delete account error:', error);
    return error;
  }
}

// Get current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) console.error('Get user error:', error.message);
  return user;
}

// Get user profile
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) console.error('Get profile error:', error.message);
  return data;
}

// ==================== Profile Management ====================

// Upload profile photo to Supabase Storage
export async function uploadProfilePhoto(userId: string, file: File): Promise<string | null> {
  const ext = file.name.split('.').pop();
  const filePath = `${userId}/avatar.${ext}`;
  const { error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });
  if (error) {
    console.error('Upload error:', error.message);
    return null;
  }
  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  return data.publicUrl;
}

// Update user profile
export async function updateProfile(userId: string, updates: { name?: string; avatar_url?: string; phone?: string; role?: string }) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  if (error) console.error('Profile update error:', error.message);
  return error;
}

// Create profile for new user
export async function createProfile(userId: string, email: string, name?: string, avatarUrl?: string) {
  const { error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email,
      name: name || email.split('@')[0],
      avatar_url: avatarUrl,
      role: 'client',
    });
  if (error) console.error('Profile creation error:', error.message);
  return error;
}

// ==================== Messages ====================

// Subscribe to messages for a ride
export function subscribeToMessages(
  rideId: string,
  callback: (message: any) => void
) {
  return supabase
    .channel(`messages:${rideId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `ride_id=eq.${rideId}` },
      (payload) => callback(payload.new)
    )
    .subscribe();
}

// Send a message
export async function sendMessage(
  rideId: string,
  senderId: string,
  receiverId: string,
  content: string
) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ ride_id: rideId, sender_id: senderId, receiver_id: receiverId, content });
  if (error) console.error('Message error:', error.message);
  return data;
}

// Get messages for a ride
export async function getMessages(rideId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('ride_id', rideId)
    .order('created_at', { ascending: true });
  if (error) console.error('Get messages error:', error.message);
  return data || [];
}

// ==================== Calls ====================

// Subscribe to calls for a ride
export function subscribeToCalls(
  rideId: string,
  callback: (call: any) => void
) {
  return supabase
    .channel(`calls:${rideId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'calls', filter: `ride_id=eq.${rideId}` },
      (payload) => callback(payload.new)
    )
    .subscribe();
}

// Initiate a call
export async function initiateCall(
  rideId: string,
  callerId: string,
  receiverId: string
) {
  const { data, error } = await supabase
    .from('calls')
    .insert({ ride_id: rideId, caller_id: callerId, receiver_id: receiverId, status: 'initiating' });
  if (error) console.error('Call error:', error.message);
  return data;
}

// Update call status
export async function updateCallStatus(callId: string, status: string) {
  const { error } = await supabase
    .from('calls')
    .update({ status })
    .eq('id', callId);
  if (error) console.error('Call update error:', error.message);
}

// ==================== Notifications ====================

// Subscribe to notifications for a user
export function subscribeToNotifications(
  userId: string,
  callback: (notification: any) => void
) {
  return supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
      (payload) => callback(payload.new)
    )
    .subscribe();
}

// Save notification
export async function saveNotification(userId: string, title: string, content: string) {
  const { error } = await supabase
    .from('notifications')
    .insert({ user_id: userId, title, content });
  if (error) console.error('Notification error:', error.message);
}

// Get notifications for a user
export async function getNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) console.error('Get notifications error:', error.message);
  return data || [];
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
  if (error) console.error('Mark notification error:', error.message);
}

// ==================== Rides ====================

// Subscribe to ride status changes
export function subscribeToRide(
  rideId: string,
  callback: (ride: any) => void
) {
  return supabase
    .channel(`ride:${rideId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'rides', filter: `id=eq.${rideId}` },
      (payload) => callback(payload.new)
    )
    .subscribe();
}

// Save ride to history
export async function saveRide(ride: {
  client_id: string;
  origin: string;
  destination: string;
  price: number;
  status?: string;
}) {
  const { data, error } = await supabase
    .from('rides')
    .insert({ ...ride, status: ride.status || 'completed' })
    .select()
    .single();
  if (error) console.error('Ride save error:', error.message);
  return data;
}

// Get ride by ID
export async function getRide(rideId: string) {
  const { data, error } = await supabase
    .from('rides')
    .select('*')
    .eq('id', rideId)
    .single();
  if (error) console.error('Get ride error:', error.message);
  return data;
}

// Update ride status
export async function updateRideStatus(rideId: string, status: string) {
  const { error } = await supabase
    .from('rides')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', rideId);
  if (error) console.error('Update ride error:', error.message);
}

// ==================== Promotions ====================

// Get all active promotions
export async function getPromotions() {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .gt('valid_until', new Date().toISOString());
  if (error) console.error('Get promotions error:', error.message);
  return data || [];
}

// Validate promotion code
export async function validatePromotion(code: string) {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('code', code.toUpperCase())
    .gt('valid_until', new Date().toISOString())
    .single();
  if (error) console.error('Validate promotion error:', error.message);
  return data;
}


// ==================== Payments ====================

// Save payment method
export async function savePaymentMethod(userId: string, cardToken: string, cardBrand: string, cardLast4: string) {
  const { data, error } = await supabase
    .from('payment_methods')
    .insert({
      user_id: userId,
      stripe_token: cardToken,
      brand: cardBrand,
      last4: cardLast4,
      is_default: true,
    })
    .select()
    .single();
  if (error) console.error('Save payment method error:', error.message);
  return data;
}

// Get payment methods for user
export async function getPaymentMethods(userId: string) {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) console.error('Get payment methods error:', error.message);
  return data || [];
}

// Delete payment method
export async function deletePaymentMethod(methodId: string) {
  const { error } = await supabase
    .from('payment_methods')
    .delete()
    .eq('id', methodId);
  if (error) console.error('Delete payment method error:', error.message);
}

// Create payment transaction
export async function createPaymentTransaction(userId: string, amount: number, rideId?: string, description?: string) {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      amount,
      ride_id: rideId,
      description: description || 'Ride Payment',
      status: 'pending',
      type: 'payment',
    })
    .select()
    .single();
  if (error) console.error('Create transaction error:', error.message);
  return data;
}

// Update transaction status
export async function updateTransactionStatus(transactionId: string, status: string, stripeId?: string) {
  const { error } = await supabase
    .from('transactions')
    .update({ status, stripe_id: stripeId, updated_at: new Date().toISOString() })
    .eq('id', transactionId);
  if (error) console.error('Update transaction error:', error.message);
}

// Get user wallet balance
export async function getUserWalletBalance(userId: string) {
  const { data, error } = await supabase
    .from('wallets')
    .select('balance')
    .eq('user_id', userId)
    .single();
  if (error) {
    // Create wallet if doesn't exist
    const { data: newWallet, error: createError } = await supabase
      .from('wallets')
      .insert({ user_id: userId, balance: 0 })
      .select()
      .single();
    if (createError) console.error('Create wallet error:', createError.message);
    return newWallet?.balance || 0;
  }
  return data?.balance || 0;
}

// Add funds to wallet
export async function addWalletFunds(userId: string, amount: number) {
  const currentBalance = await getUserWalletBalance(userId);
  const { error } = await supabase
    .from('wallets')
    .update({ balance: currentBalance + amount })
    .eq('user_id', userId);
  if (error) console.error('Add funds error:', error.message);
  
  // Create transaction record
  await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      amount,
      type: 'topup',
      description: 'Wallet Top-up',
      status: 'completed',
    });
}

// Deduct from wallet
export async function deductWalletFunds(userId: string, amount: number, rideId: string) {
  const currentBalance = await getUserWalletBalance(userId);
  if (currentBalance < amount) {
    throw new Error('Insufficient wallet balance');
  }
  
  const { error } = await supabase
    .from('wallets')
    .update({ balance: currentBalance - amount })
    .eq('user_id', userId);
  if (error) console.error('Deduct funds error:', error.message);
  
  // Create transaction record
  await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      amount: -amount,
      ride_id: rideId,
      type: 'payment',
      description: 'Ride Payment',
      status: 'completed',
    });
}

// Get transaction history
export async function getTransactionHistory(userId: string, limit = 50) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) console.error('Get transaction history error:', error.message);
  return data || [];
}

// ==================== Driver Registration ====================

// Submit driver application
export async function submitDriverApplication(userId: string, applicationData: {
  licenseNumber: string;
  licenseExpiry: string;
  insuranceNumber: string;
  insuranceExpiry: string;
  vehicleRegistration: string;
  vehicleType: string;
  licenseDocument?: string;
  insuranceDocument?: string;
  registrationDocument?: string;
}) {
  const { data, error } = await supabase
    .from('driver_applications')
    .insert({
      user_id: userId,
      ...applicationData,
      status: 'pending',
    })
    .select()
    .single();
  if (error) console.error('Submit driver application error:', error.message);
  return data;
}

// Subscribe to driver applications (for admin)
export function subscribeToDriverApplications(callback: (application: any) => void) {
  return supabase
    .channel('driver_applications')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'driver_applications' },
      (payload) => callback(payload.new)
    )
    .subscribe();
}

// Get driver application
export async function getDriverApplication(userId: string) {
  const { data, error } = await supabase
    .from('driver_applications')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) console.error('Get driver application error:', error.message);
  return data;
}

// Update driver application status
export async function updateDriverApplicationStatus(applicationId: string, status: string, notes?: string) {
  const { error } = await supabase
    .from('driver_applications')
    .update({ status, admin_notes: notes, updated_at: new Date().toISOString() })
    .eq('id', applicationId);
  if (error) console.error('Update driver application error:', error.message);
}

// Approve driver (make them official)
export async function approveDriver(userId: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ role: 'driver', is_verified: true })
    .eq('id', userId);
  if (error) console.error('Approve driver error:', error.message);
}

// Get all pending driver applications (for admin)
export async function getPendingDriverApplications() {
  const { data, error } = await supabase
    .from('driver_applications')
    .select('*, profiles(*)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });
  if (error) console.error('Get pending applications error:', error.message);
  return data || [];
}
