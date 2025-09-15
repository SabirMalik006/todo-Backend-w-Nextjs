exports.uploadImage = async (req, res) => {
  try {
    

    res.json({
      success: true,
      file: req.file,
    });
  } catch (error) {
    console.error("Upload error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Upload failed",
      error, 
    });
  }
};
