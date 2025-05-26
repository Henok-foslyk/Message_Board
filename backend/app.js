const express = require('express');
const cors = require('cors');
const postsRouter = require('./routes/posts');

const app = express();
const port = process.env.PORT || 5050;

// Middleware
app.use(cors()); // Allow requests from frontend
app.use(express.json()); // Parse JSON bodies

// Routes
app.use('/api/posts', postsRouter);

// Health check or root route
app.get('/', (req, res) => {
  res.send('Message Board API is running');
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
