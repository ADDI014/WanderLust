const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

// Load Mapbox token from environment
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// ===========================
// List all listings
// ===========================
module.exports.index = async (req, res, next) => {
  try {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  } catch (err) {
    next(err);
  }
};

// ===========================
// Render form to create new listing
// ===========================
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// ===========================
// Show a specific listing
// ===========================
module.exports.showListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("owner");

    if (!listing) {
      req.flash("error", "Listing you requested for does not exist");
      return res.redirect("/listings"); // ✅ return prevents double send
    }

    return res.render("listings/show.ejs", { listing });
  } catch (err) {
    next(err);
  }
};

// ===========================
// Create new listing
// ===========================
module.exports.createListing = async (req, res, next) => {
  try {
    const response = await geocodingClient
      .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
      .send();

    const { path: url, filename } = req.file;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = response.body.features[0].geometry;

    await newListing.save();

    req.flash("success", "New listing created!");
    return res.redirect("/listings");
  } catch (err) {
    next(err);
  }
};

// ===========================
// Render edit form
// ===========================
module.exports.renderEditForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing you requested for does not exist");
      return res.redirect("/listings");
    }

    const originalImageUrl = listing.image?.url?.replace("/upload", "/upload/w_250") || "";
    return res.render("listings/edit.ejs", { listing, originalImageUrl });
  } catch (err) {
    next(err);
  }
};

// ===========================
// Update listing
// ===========================
module.exports.updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    if (req.file) {
      const { path: url, filename } = req.file;
      listing.image = { url, filename };
      await listing.save();
    }

    req.flash("success", "Listing updated successfully");
    return res.redirect(`/listings/${id}`);
  } catch (err) {
    next(err);
  }
};

// ===========================
// Delete listing
// ===========================
module.exports.destroyListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);

    if (!deletedListing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    req.flash("success", "Listing deleted successfully");
    return res.redirect("/listings");
  } catch (err) {
    next(err);
  }
};
