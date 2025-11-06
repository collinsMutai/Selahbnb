// controllers/listingController.js
import Listing from "../models/Listing.js";

export const getListings = async (req, res) => {
  try {
    const listings = await Listing.find().populate("host", "name email");
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createListing = async (req, res) => {
  try {
    const { title, location, price, imageUrl, description } = req.body;

    const listing = new Listing({
      title,
      location,
      price,
      imageUrl,
      description,
      host: req.user._id // ✅ set the host from the logged-in user
    });

    const savedListing = await listing.save();
    res.status(201).json(savedListing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
      "host",
      "name email"
    );
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update a listing
export const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Optional: Ensure that only the host (owner) can update
    if (listing.host.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "Not authorized to update this listing" });
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // returns updated doc
    );

    res.status(200).json(updatedListing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete a listing
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Ensure only host can delete
    if (listing.host.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "Not authorized to delete this listing" });
    }

    await listing.deleteOne();

    res.status(200).json({ message: "Listing deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
