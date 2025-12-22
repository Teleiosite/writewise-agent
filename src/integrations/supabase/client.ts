import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Replace with your actual Supabase project URL and anon key
const supabaseUrl = 'https://netgvvgvnroatmrbtuec.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ldGd2dmd2bnJvYXRtcmJ0dWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MjY2OTUsImV4cCI6MjA4MjAwMjY5NX0.NSASKSJiA1KH3V5oCQHOa0kcayN-lPB7gw3qB3PL6a0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
