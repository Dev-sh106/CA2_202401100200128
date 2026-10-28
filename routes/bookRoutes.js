
const express = require('express');
const mongoose = require('mongoose');
const Book = require('../models/Book');

const router = express.Router();


router.post('/', async (req, res) => {
  try {
    const { title, author, category } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: 'Book title is required'
      });
    }

    const book = await Book.create({
      title,
      author,
      category
    });

    res.status(201).json({
      message: 'Book added successfully',
      book
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: error.message
      });
    }

    res.status(500).json({
      message: 'Server error while adding book'
    });
  }
});


router.get('/', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 5, 1),
      100
    );

    const skip = (page - 1) * limit;

    const books = await Book.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalBooks = await Book.countDocuments();

    res.status(200).json({
      currentPage: page,
      limit,
      totalBooks,
      totalPages: Math.ceil(totalBooks / limit),
      books
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error while retrieving books'
    });
  }
});


router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: 'Invalid book ID'
      });
    }

    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({
        message: 'isAvailable must be true or false'
      });
    }

    const book = await Book.findByIdAndUpdate(
      id,
      { isAvailable },
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({
        message: 'Book not found'
      });
    }

    res.status(200).json({
      message: 'Book availability updated successfully',
      book
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error while updating book'
    });
  }
});

module.exports = router;
