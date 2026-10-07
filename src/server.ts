import app from './app';
import { connectDatabase } from './config/database';
import './models'; // Initialize all model associations

const PORT = parseInt(process.env.PORT || '5000', 10);

const startServer = async () => {
  try {
    await connectDatabase();
    
    app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`🚀 Padikam (പഠിക്കാം) English Learning API is RUNNING`);
      console.log(`📡 Port: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🕒 Timezone: ${process.env.APP_TIMEZONE || 'Asia/Kolkata'}`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api`);
      console.log(`=================================================`);
    });
  } catch (error) {
    console.error('Failed to start the server:', error);
    process.exit(1);
  }
};

startServer();
