import jwt from 'jsonwebtoken';

// Generate JWT token
const generateToken = (id) => {
  try {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });
  } catch (error) {
    console.log('Route Error:', error.message);
    throw new Error('Token generation failed');
  }
};

// Set token in HTTP-only cookie
export const sendTokenResponse = (user, statusCode, res) => {
  try {
    // Create token
    const token = generateToken(user._id);
    
    // Set cookie options
    const options = {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    };
    
    // Return response with token in cookie
    return res
      .status(statusCode)
      .cookie('jwt', token, options)
      .json({
        success: true,
        token
      });
  } catch (error) {
    console.log('Route Error:', error.message);
    throw new Error('Failed to send token response');
  }
};