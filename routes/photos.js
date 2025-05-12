const express = require('express');
const router = express.Router();
const Photo = require('../models/Photo');
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 2 // Limit to 2 files at a time
  },
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Get all photos (admin only)
router.get('/all', async (req, res) => {
  try {
    console.log('Fetching all photos...');
    const photos = await Photo.find()
      .select('-imageData') // Exclude image data from the response
      .sort({ createdAt: -1 });
    
    console.log(`Found ${photos.length} photos`);
    return res.status(200).json({
      success: true,
      data: photos
    });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching photos',
      error: error.message
    });
  }
});

// Get approved photos (public)
router.get('/approved', async (req, res) => {
  try {
    console.log('Fetching approved photos...');
    const photos = await Photo.find({ status: 'approved' })
      .select('-imageData') // Exclude image data from the response
      .sort({ createdAt: -1 });
    
    console.log(`Found ${photos.length} approved photos`);
    return res.status(200).json({
      success: true,
      data: photos
    });
  } catch (error) {
    console.error('Error fetching approved photos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching approved photos',
      error: error.message
    });
  }
});

// Upload multiple photos (max 2)
router.post('/upload', upload.array('photos', 2), async (req, res) => {
  try {
    console.log('Received upload request:', {
      files: req.files ? req.files.map(file => ({
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      })) : 'No files',
      body: req.body
    });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No photos uploaded'
      });
    }

    if (req.files.length > 2) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 2 photos can be uploaded at a time'
      });
    }

    const savedPhotos = [];
    for (const file of req.files) {
      const photo = new Photo({
        imageData: file.buffer,
        contentType: file.mimetype,
        title: file.originalname,
        uploadedBy: req.body.uploadedBy || 'user',
        status: 'approved' // Set status to approved by default
      });

      await photo.save();
      console.log('Photo saved successfully:', photo._id);
      
      savedPhotos.push({
        _id: photo._id,
        title: photo.title,
        status: photo.status,
        uploadedBy: photo.uploadedBy,
        createdAt: photo.createdAt
      });
    }

    return res.status(201).json({
      success: true,
      message: `${savedPhotos.length} photo(s) uploaded successfully`,
      data: savedPhotos
    });
  } catch (error) {
    console.error('Error uploading photos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error uploading photos',
      error: error.message
    });
  }
});

// Get photo by ID
router.get('/:id', async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    // Set the content type and send the image data
    res.set('Content-Type', photo.contentType);
    res.send(photo.imageData);
  } catch (error) {
    console.error('Error fetching photo:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching photo',
      error: error.message
    });
  }
});

// Update photo status (admin only)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const photo = await Photo.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    ).select('-imageData'); // Exclude image data from the response

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Photo ${status} successfully`,
      data: photo
    });
  } catch (error) {
    console.error('Error updating photo status:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating photo status',
      error: error.message
    });
  }
});

// Delete photo (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const photo = await Photo.findByIdAndDelete(req.params.id);
    
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting photo',
      error: error.message
    });
  }
});

module.exports = router; 