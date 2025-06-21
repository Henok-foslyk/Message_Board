import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from '@mui/material';
import { Timestamp} from 'firebase/firestore';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ReplyIcon from '@mui/icons-material/Reply';  // Importing ReplyIcon
import axios from 'axios';

const API_URL = 'http://localhost:5050/api/posts';

export default function App() {
  const [posts, setPosts] = useState([]);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [editPostId, setEditPostId] = useState(null);
  const [editMessage, setEditMessage] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyPostId, setReplyPostId] = useState(null);

  // Sorting and Filtering States
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'oldest', 'username'
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch posts on mount
  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const res = await axios.get(API_URL);
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to fetch posts', err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim() || !message.trim()) return;

    try {
      await axios.post(API_URL, { username, message });
      setUsername('');
      setMessage('');
      fetchPosts();
    } catch (err) {
      console.error('Failed to post message', err);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this post?')) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchPosts();
    } catch (err) {
      console.error('Failed to delete post', err);
    }
  }

  function openEditDialog(post) {
    setEditPostId(post.id);
    setEditMessage(post.message);
    setEditDialogOpen(true);
  }

  async function handleEditSave() {
    if (!editMessage.trim()) return;

    try {
      await axios.put(`${API_URL}/${editPostId}`, { message: editMessage });
      setEditDialogOpen(false);
      setEditPostId(null);
      setEditMessage('');
      fetchPosts();
    } catch (err) {
      console.error('Failed to update post', err);
    }
  }

  async function handleReplySubmit(e) {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    try {
      await axios.post(`${API_URL}/${replyPostId}/replies`, { username, message: replyMessage });
      setReplyMessage('');
      setReplyPostId(null);
      fetchPosts();
    } catch (err) {
      console.error('Failed to add reply', err);
    }
  }

  function openReplyDialog(postId) {
    setReplyPostId(postId);
  }

  // Sorting Logic
  const sortPosts = (posts) => {
    return posts.sort((a, b) => {
      // Convert Firebase Timestamps to JavaScript Dates
      const dateA = new Timestamp(a.createdAt._seconds, a.createdAt._nanoseconds).toDate();
      const dateB = new Timestamp(b.createdAt._seconds, b.createdAt._nanoseconds).toDate();
  
      if (sortOrder === 'newest') {
        return dateB - dateA; // Newest first (dateB comes after dateA)
      }
      if (sortOrder === 'oldest') {
        return dateA - dateB; // Oldest first (dateA comes before dateB)
      }
      if (sortOrder === 'username') {
        return a.username.localeCompare(b.username); // Alphabetically by username
      }
      return 0;
    });
  };

  // Filtering Logic
  const filterPosts = (posts) => {
    return posts.filter((post) => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      return (
        post.username.toLowerCase().includes(lowerCaseSearchTerm) ||
        post.message.toLowerCase().includes(lowerCaseSearchTerm)
      );
    });
  };

  // Final posts after sorting and filtering
  const displayedPosts = filterPosts(sortPosts(posts));

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Message Board
      </Typography>

      {/* Message Form*/}
      <Paper sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            minRows={2}
            required
          />
          <Box textAlign="right" mt={2}>
            <Button variant="contained" type="submit">
              Post Message
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Sorting and Filtering */}
      <Box sx={{ backgroundColor: 'white', p: 3, mb: 4}}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            label="Sort By"
          >
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="oldest">Oldest</MenuItem>
            <MenuItem value="username">Username</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Search Messages"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          margin="normal"
        />
      </Box>

      {/* Posts List*/}
      <Paper sx={{ p: 2 }}>
        <List>
          {displayedPosts.length === 0 && (
            <Typography variant="body1" align="center" color="text.secondary">
              No messages yet.
            </Typography>
          )}
          {displayedPosts.map((post) => (
            <div key={post.id}>
              <ListItem
                sx={{
                  display: 'flex', // Use flexbox to align content horizontally
                  flexDirection: 'column', // Stack items vertically
                  paddingBottom: 2, // Padding to separate posts
                  width: '100%', // Ensure it takes up the full width
                }}
              >
                {/* Username and buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {post.username}:
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <IconButton edge="end" aria-label="edit" onClick={() => openEditDialog(post)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(post.id)}>
                      <DeleteIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="reply" onClick={() => openReplyDialog(post.id)}>
                      <ReplyIcon />
                    </IconButton>
                  </Box>
                </Box>

                {/* Message */}
                <Box sx={{ paddingLeft: 3, paddingTop: 1, width: '100%' }}>
                  <Typography variant="body1" sx={{ textAlign: 'left', wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                    {post.message}
                  </Typography>
                </Box>
              </ListItem>

              {replyPostId === post.id && (
  <Box sx={{ paddingLeft: 6, mt: 1 }}>
    <form onSubmit={handleReplySubmit}>
      <TextField
        label="Reply"
        value={replyMessage}
        onChange={(e) => setReplyMessage(e.target.value)}
        fullWidth
        multiline
        minRows={2}
        required
      />
      <Box mt={1} textAlign="right">
        <Button type="submit" variant="outlined" size="small" sx={{ mr: 1 }}>
          Send Reply
        </Button>
        <Button variant="text" size="small" onClick={() => setReplyPostId(null)}>
          Cancel
        </Button>
      </Box>
    </form>
  </Box>
)}


              {/* Render Replies */}
              {post.replies && post.replies.map((reply, index) => (
                <ListItem key={index} sx={{ paddingLeft: 6 }}>
                  <ListItemText
                    primary={`${reply.username}:`}
                    secondary={reply.message}
                  />
                </ListItem>
              ))}
            </div>
          ))}
        </List>
      </Paper>

      {/* Edit and Reply Dialogs */}
      {/* ... (Dialog components remain unchanged) */}
    </Container>
  );
}
