// Comment management functions

// Load comments for a novel
// Comment management functions

// Load comments for a novel
export async function loadComments(novelId) {
    try {
        if (!window.supabase) {
            throw new Error('Supabase client not initialized');
        }
        
        const { data: comments, error } = await window.supabase
            .from('comments')
            .select('*')
            .eq('novel_id', novelId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const commentsList = document.getElementById('commentsList');
        if (!commentsList) return;
        
        if (!comments || comments.length === 0) {
            commentsList.innerHTML = '<p class="text-center">No comments yet. Be the first to comment!</p>';
            return;
        }
        
        commentsList.innerHTML = comments.map(comment => `
            <div class="comment">
                <div class="comment-header">
                    <span class="comment-author">${escapeHtml(comment.username)}</span>
                    <span class="comment-date">${new Date(comment.created_at).toLocaleDateString()}</span>
                </div>
                <div class="comment-content">${escapeHtml(comment.content)}</div>
            </div>
        `).join('');
        
        // Update comment count
        const commentCount = document.getElementById('commentCount');
        if (commentCount) {
            commentCount.textContent = comments.length;
        }
    } catch (error) {
        console.error('Error loading comments:', error);
        const commentsList = document.getElementById('commentsList');
        if (commentsList) {
            commentsList.innerHTML = '<p class="text-center">Error loading comments.</p>';
        }
    }
}

// Add a comment
export async function addComment(novelId) {
    try {
        if (!window.supabase) {
            throw new Error('Supabase client not initialized');
        }
        
        const { data: { user } } = await window.supabase.auth.getUser();
        if (!user) {
            alert('Please login to comment');
            window.location.href = 'login.html';
            return;
        }
        
        const commentInput = document.getElementById('commentInput');
        const content = commentInput.value.trim();
        
        if (!content) {
            alert('Please enter a comment');
            return;
        }
        
        // Get username
        let username = user.email;
        try {
            const { data: profile } = await window.supabase
                .from('profiles')
                .select('username')
                .eq('id', user.id)
                .single();
            
            if (profile) username = profile.username;
        } catch (error) {
            console.log('Using email as username');
        }
        
        // Insert comment
        const { error } = await window.supabase
            .from('comments')
            .insert([{
                novel_id: novelId,
                user_id: user.id,
                username: username,
                content: content,
                created_at: new Date().toISOString()
            }]);
        
        if (error) throw error;
        
        // Clear input and reload comments
        commentInput.value = '';
        await loadComments(novelId);
        
    } catch (error) {
        console.error('Error adding comment:', error);
        alert('Error adding comment: ' + error.message);
    }
}

// Helper function to escape HTML
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

window.addComment = addComment;

// Add a comment
export async function addComment(novelId) {
    try {
        if (!window.supabase) {
            throw new Error('Supabase client not initialized');
        }
        
        const { data: { user } } = await window.supabase.auth.getUser();
        if (!user) {
            alert('Please login to comment');
            window.location.href = 'login.html';
            return;
        }
        
        const commentInput = document.getElementById('commentInput');
        const content = commentInput.value.trim();
        
        if (!content) {
            alert('Please enter a comment');
            return;
        }
        
        // Get user profile
        let username = user.email;
        try {
            const { data: profile, error: profileError } = await window.supabase
                .from('profiles')
                .select('username')
                .eq('id', user.id)
                .single();
            
            if (!profileError && profile) {
                username = profile.username;
            }
        } catch (profileError) {
            console.log('Using email as username:', profileError);
        }
        
        const { error } = await window.supabase
            .from('comments')
            .insert([
                {
                    novel_id: novelId,
                    user_id: user.id,
                    username: username,
                    content: content,
                    created_at: new Date().toISOString()
                }
            ]);
        
        if (error) throw error;
        
        // Clear input and reload comments
        commentInput.value = '';
        await loadComments(novelId);
    } catch (error) {
        alert('Error adding comment: ' + error.message);
    }
}

// Helper function to escape HTML
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Make functions available globally
window.loadComments = loadComments;
window.addComment = addComment;