import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    cityName: { type: String, required: true, trim: true },
    country: String,
    emoji: String,
    date: Date, // planned date
    notes: String,
    position: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Plan", planSchema);
