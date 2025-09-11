exports.uploadImage = async (req, res) => {
    try {
      console.log("REQ.FILE ===>", req.file.path);
  
      res.json({
        success: true,
        file: req.file,
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Upload failed" });
    }
  };
  