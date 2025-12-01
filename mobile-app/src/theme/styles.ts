export const colors = {
  primary: '#C2185B',      // Ruby Red - לצבע הראשי
  secondary: '#FF4081',    // Hot Pink - להדגשות
  background: '#F5F5F5',   // אפור בהיר מאוד לרקע כללי
  card: '#FFFFFF',         // לבן לכרטיסים
  text: '#263238',         // אפור כהה לטקסט
  textLight: '#757575',    // אפור בהיר לטקסט משני
  border: '#E0E0E0',
  error: '#D32F2F',
};

export const globalStyles = {
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // צל לאנדרואיד
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  }
};