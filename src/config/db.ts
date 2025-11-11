import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI!;
    await mongoose.connect(mongoUri);
    
    const dbName = mongoose.connection.db?.databaseName;
    console.log("🟢 MongoDB conectado correctamente");
    console.log(`📊 Base de datos: ${dbName || 'No especificada'}`);
    console.log(`🔗 URI: ${mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`); // Ocultar credenciales
    
    // Verificar colecciones disponibles
    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log(`📚 Colecciones disponibles: ${collections.map(c => c.name).join(', ')}`);
    }
  } catch (error) {
    console.error("🔴 Error conectando a MongoDB:", error);
    process.exit(1);
  }
};
