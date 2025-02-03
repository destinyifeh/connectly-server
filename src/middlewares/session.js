export const verifyUserSession = async (req, res, next) => {
  try {
    // Check if the session ID exists in the store
    const sessionId = req.session.id;
    const sessionExists = await req.sessionStore.get(sessionId);

    if (!sessionExists) {
      return res
        .status(401)
        .json({message: 'Unauthorized. Session does not exist.'});
    }

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Error verifying session:', error);
    res.status(500).json({message: 'Internal Server Error'});
  }
};
