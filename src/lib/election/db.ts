import "server-only";
import mongoose from "mongoose";

// Reuse one connection across hot reloads and serverless invocations.
const globalForMongoose = globalThis as unknown as {
  _electionMongoose?: Promise<typeof mongoose>;
};

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (!globalForMongoose._electionMongoose) {
    globalForMongoose._electionMongoose = mongoose
      // Fail in 8s instead of mongoose's 30s default, so a DB outage doesn't hang requests.
      .connect(uri, { dbName: process.env.MONGODB_DB || "election_monitoring", maxPoolSize: 10, serverSelectionTimeoutMS: 8000 })
      .catch((err) => {
        globalForMongoose._electionMongoose = undefined;
        throw err;
      });
  }
  return globalForMongoose._electionMongoose;
}
