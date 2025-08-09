import mongoose from "mongoose";

const citySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    cityName: { type: String, required: true },
    country: String,
    emoji: String,
    date: Date,
    notes: String,
    position: { lat: Number, lng: Number }
  },
  { timestamps: true }
);

export default mongoose.model("City", citySchema);
