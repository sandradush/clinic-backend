// controllers/loginController.js
const rateLimit = require('express-rate-limit');
const supabase = require('../config/supabase');


// Rate limiter for signup/signin
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: { error: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to both signup and signin
exports.signUp = [authLimiter, async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    console.log('Attempting signup for:', email);

    // Check if user already exists first
    // Skip this check to avoid profiles table error
    // const { data: existingUser, error: checkError } = await supabase
    //   .from('profiles')
    //   .select('email')
    //   .eq('email', email)
    //   .maybeSingle();

    // if (checkError) {
    //   console.error('Check user error:', checkError);
    // }

    // if (existingUser) {
    //   return res.status(400).json({ error: 'User already exists' });
    // }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || '',
          role: role || 'user',
          email_verified: false // Explicitly set
        }
      }
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      
      // Handle specific errors
      if (authError.message.includes('rate limit')) {
        return res.status(429).json({ 
          error: 'Too many signup attempts. Please wait 15 minutes and try again.' 
        });
      }
      
      return res.status(400).json({ error: authError.message });
    }

    // If email confirmation is enabled and user needs to confirm
    if (authData.user && !authData.user.email_confirmed_at) {
      console.log('User created, email confirmation required:', authData.user.id);
      
      return res.status(201).json({ 
        message: 'Registration successful! Please check your email to confirm your account.',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          email_confirmed: false
        }
      });
    }

    // User is auto-confirmed
    console.log('User created and confirmed:', authData.user.id);
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: authData.user.user_metadata?.name,
        role: authData.user.user_metadata?.role,
        email_confirmed: !!authData.user.email_confirmed_at
      }
    });

  } catch (error) {
    console.error('Server error during signup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}];

exports.signIn = [authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    console.log('Attempting signin for:', email);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('Signin error:', authError);
      
      if (authError.message.includes('rate limit')) {
        return res.status(429).json({ 
          error: 'Too many login attempts. Please wait 15 minutes and try again.' 
        });
      }
      
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Signin successful for:', authData.user.id);
    
    res.status(200).json({
      message: 'Sign in successful',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: authData.user.user_metadata?.name,
        role: authData.user.user_metadata?.role,
        email_confirmed: !!authData.user.email_confirmed_at
      },
      session: authData.session // Return session for frontend
    });

  } catch (error) {
    console.error('Server error during signin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}];

exports.signOut = async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Signout error:', error);
      return res.status(400).json({ error: error.message });
    }
    
    res.status(200).json({ message: 'Sign out successful' });
  } catch (error) {
    console.error('Server error during signout:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name,
        role: user.user_metadata?.role,
        email_confirmed: !!user.email_confirmed_at
      }
    });
  } catch (error) {
    console.error('Server error getting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};