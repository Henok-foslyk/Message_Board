const express = require('express');
const router = express.Router();
const {db, FieldValue} = require('../firebase');

// GET /api/posts - Get all posts (sorted by newest first)
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('posts').orderBy('createdAt', 'desc').get();
    const posts = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        replies: data.replies || []  // Ensure replies are included
      };
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// POST /api/posts - Create a new post
router.post('/', async (req, res) => {
  const { username, message } = req.body;
  if (!username || !message) {
    return res.status(400).json({ error: 'Username and message are required' });
  }

  try {
    const newPost = {
      username,
      message,
      createdAt: new Date(),
      updatedAt: new Date(),
      replies: []  // Initialize replies as an empty array
    };
    const docRef = await db.collection('posts').add(newPost);
    res.status(201).json({ id: docRef.id, ...newPost });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// POST /api/posts/:id/replies - Add a reply to a post
router.post('/:id/replies', async (req, res) => {
  const { id } = req.params;
  const { username, message } = req.body;
  
  if (!username || !message) {
    return res.status(400).json({ error: 'Username and message are required' });
  }

  try {
    const postRef = db.collection('posts').doc(id);

    // Check if the post exists
    const postSnapshot = await postRef.get();
    if (!postSnapshot.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Add the reply to the post document's 'replies' array field
    await postRef.update({
      replies: FieldValue.arrayUnion({
        username,
        message,
        createdAt: new Date(),
      }),
    });

    res.status(201).json({ message: 'Reply added successfully' });
  } catch (err) {
    console.error('Error adding reply:', err); // Log detailed error
    res.status(500).json({ error: 'Failed to add reply', details: err.message });
  }
});

// PUT /api/posts/:id - Update a post message
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required to update' });
  }

  try {
    await db.collection('posts').doc(id).update({
      message,
      updatedAt: new Date()
    });
    res.json({ id, message, updatedAt: new Date() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// DELETE /api/posts/:id - Delete a post
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.collection('posts').doc(id).delete();
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

module.exports = router;
