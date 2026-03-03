// Novel management functions

// Load novels on homepage
// Novel management functions

// Load novels on homepage
export async function loadNovels() {
    try {
        if (!window.supabase) {
            throw new Error('Supabase client not initialized');
        }
        
        const { data: novels, error } = await window.supabase
            .from('novels')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const novelsList = document.getElementById('novelsList');
        if (!novelsList) return;
        
        if (!novels || novels.length === 0) {
            novelsList.innerHTML = '<p class="text-center">No novels yet. Be the first to write one!</p>';
            return;
        }
        
        novelsList.innerHTML = novels.map(novel => `
            <div class="novel-card">
                <h3><a href="novel.html?id=${novel.id}">${escapeHtml(novel.title)}</a></h3>
                <div class="novel-meta">
                    <span>By ${escapeHtml(novel.author_name)}</span>
                    <span>${new Date(novel.created_at).toLocaleDateString()}</span>
                </div>
                <div class="novel-excerpt">
                    ${escapeHtml(novel.content.substring(0, 200))}...
                </div>
                <div class="novel-stats">
                    <span>❤️ ${novel.likes || 0}</span>
                    <span>👁️ ${novel.clicks || 0}</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading novels:', error);
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



// Load user's novels on dashboard
export async function loadMyNovels() {
    try {
        if (!window.supabase) {
            throw new Error('Supabase client not initialized');
        }
        
        const { data: { user } } = await window.supabase.auth.getUser();
        if (!user) return;
        
        const { data: novels, error } = await window.supabase
            .from('novels')
            .select('*')
            .eq('author_id', user.id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Update stats
        const novelCountEl = document.getElementById('novelCount');
        const totalViewsEl = document.getElementById('totalViews');
        const totalLikesEl = document.getElementById('totalLikes');
        
        if (novelCountEl) novelCountEl.textContent = novels?.length || 0;
        if (totalViewsEl) totalViewsEl.textContent = novels?.reduce((sum, n) => sum + (n.clicks || 0), 0) || 0;
        if (totalLikesEl) totalLikesEl.textContent = novels?.reduce((sum, n) => sum + (n.likes || 0), 0) || 0;
        
        const myNovelsList = document.getElementById('myNovelsList');
        if (!myNovelsList) return;
        
        if (!novels || novels.length === 0) {
            myNovelsList.innerHTML = '<p class="text-center">You haven\'t written any novels yet. <a href="create-novel.html">Start writing!</a></p>';
            return;
        }
        
        myNovelsList.innerHTML = novels.map(novel => `
            <div class="novel-card">
                <h3><a href="novel.html?id=${novel.id}">${escapeHtml(novel.title)}</a></h3>
                <div class="novel-meta">
                    <span>Published: ${new Date(novel.created_at).toLocaleDateString()}</span>
                </div>
                <div class="novel-excerpt">
                    ${escapeHtml(novel.content.substring(0, 150))}...
                </div>
                <div class="novel-stats">
                    <span>❤️ ${novel.likes || 0}</span>
                    <span>👁️ ${novel.clicks || 0}</span>
                </div>
                <div style="margin-top: 1rem;">
                    <button onclick="deleteNovel(${novel.id})" class="btn" style="background-color: #e74c3c; color: white;">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading my novels:', error);
    }
}

// Create a new novel
export async function createNovel(event) {
    event.preventDefault();
    
    try {
        if (!window.supabase) {
            throw new Error('Supabase client not initialized');
        }
        
        // Check if user is logged in
        const { data: { user }, error: userError } = await window.supabase.auth.getUser();
        
        if (userError) throw userError;
        
        if (!user) {
            alert('Please login to create a novel');
            window.location.href = 'login.html';
            return;
        }
        
        // Get form values
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        
        if (!title || !content) {
            alert('Please fill in all fields');
            return;
        }
        
        // Get user profile
        let authorName = user.email;
        try {
            const { data: profile, error: profileError } = await window.supabase
                .from('profiles')
                .select('username')
                .eq('id', user.id)
                .single();
            
            if (!profileError && profile) {
                authorName = profile.username;
            }
        } catch (profileError) {
            console.log('Using email as author name');
        }
        
        // Insert the novel
        const { data, error } = await window.supabase
            .from('novels')
            .insert([
                {
                    title: title,
                    content: content,
                    author_id: user.id,
                    author_name: authorName,
                    clicks: 0,
                    likes: 0,
                    created_at: new Date().toISOString()
                }
            ])
            .select();
        
        if (error) {
            console.error('Insert error:', error);
            throw error;
        }
        
        alert('Novel published successfully!');
        window.location.href = 'dashboard.html';
        
    } catch (error) {
        console.error('Error creating novel:', error);
        alert('Error creating novel: ' + (error.message || 'Unknown error'));
    }
}

// Load single novel with proper formatting
export async function loadNovel(novelId) {
    try {
        // Show loading, hide content
        const loadingEl = document.getElementById('loadingIndicator');
        const novelView = document.getElementById('novelView');
        const commentsSection = document.getElementById('commentsSection');
        
        if (loadingEl) loadingEl.style.display = 'block';
        if (novelView) novelView.style.display = 'none';
        if (commentsSection) commentsSection.style.display = 'none';
        
        if (!window.supabase) {
            throw new Error('Supabase client not initialized');
        }
        
        const { data: novel, error } = await window.supabase
            .from('novels')
            .select('*')
            .eq('id', novelId)
            .single();
        
        if (error) throw error;
        
        // Set basic info
        document.getElementById('novelTitle').textContent = novel.title;
        document.getElementById('novelAuthor').textContent = novel.author_name;
        document.getElementById('novelDate').textContent = new Date(novel.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Format and display the content
        const contentElement = document.getElementById('novelContent');
        contentElement.innerHTML = formatNovelContent(novel.content);
        
        // Update stats
        document.getElementById('likeCount').textContent = novel.likes || 0;
        document.getElementById('clickCount').textContent = novel.clicks || 0;
        
        // Update page title
        document.title = `${novel.title} - NovelHub`;
        
        // Hide loading, show content
        if (loadingEl) loadingEl.style.display = 'none';
        if (novelView) novelView.style.display = 'block';
        if (commentsSection) commentsSection.style.display = 'block';
        
        // Load comment count
        const { count, error: countError } = await window.supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('novel_id', novelId);
        
        if (!countError) {
            document.getElementById('commentCount').textContent = count || 0;
        }
    } catch (error) {
        console.error('Error loading novel:', error);
        
        // Show error message
        const loadingEl = document.getElementById('loadingIndicator');
        if (loadingEl) {
            loadingEl.innerHTML = 'Error loading novel. <a href="index.html">Return to home</a>';
        }
    }
}

// Format novel content for display
function formatNovelContent(content) {
    if (!content) return '';
    
    // Escape HTML to prevent XSS
    let escaped = escapeHtml(content);
    
    // Split into paragraphs (by double newlines)
    let paragraphs = escaped.split(/\n\s*\n/);
    
    // If no double newlines, split by single newlines
    if (paragraphs.length <= 1) {
        paragraphs = escaped.split('\n');
    }
    
    // Wrap each paragraph in <p> tags and filter out empty ones
    return paragraphs
        .filter(p => p.trim().length > 0)
        .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
        .join('');
}

// Increment clicks
export async function incrementClicks(novelId) {
    try {
        if (!window.supabase) return;
        
        // First get current clicks
        const { data: novel, error: getError } = await window.supabase
            .from('novels')
            .select('clicks')
            .eq('id', novelId)
            .single();
        
        if (getError) throw getError;
        
        // Update clicks
        const { error: updateError } = await window.supabase
            .from('novels')
            .update({ clicks: (novel.clicks || 0) + 1 })
            .eq('id', novelId);
        
        if (updateError) throw updateError;
    } catch (error) {
        console.error('Error incrementing clicks:', error);
    }
}

// Increment likes
export async function incrementLikes(novelId) {
    try {
        if (!window.supabase) return;
        
        const { data: { user } } = await window.supabase.auth.getUser();
        if (!user) {
            alert('Please login to like novels');
            window.location.href = 'login.html';
            return;
        }
        
        // First get current likes
        const { data: novel, error: getError } = await window.supabase
            .from('novels')
            .select('likes')
            .eq('id', novelId)
            .single();
        
        if (getError) throw getError;
        
        // Update likes
        const newLikes = (novel.likes || 0) + 1;
        const { error: updateError } = await window.supabase
            .from('novels')
            .update({ likes: newLikes })
            .eq('id', novelId);
        
        if (updateError) throw updateError;
        
        // Update UI
        const likeCountEl = document.getElementById('likeCount');
        if (likeCountEl) likeCountEl.textContent = newLikes;
    } catch (error) {
        console.error('Error incrementing likes:', error);
    }
}

// Delete novel
export async function deleteNovel(novelId) {
    if (!confirm('Are you sure you want to delete this novel?')) return;
    
    try {
        if (!window.supabase) {
            throw new Error('Supabase client not initialized');
        }
        
        const { data: { user } } = await window.supabase.auth.getUser();
        if (!user) return;
        
        const { error } = await window.supabase
            .from('novels')
            .delete()
            .eq('id', novelId)
            .eq('author_id', user.id);
        
        if (error) throw error;
        
        alert('Novel deleted successfully');
        loadMyNovels(); // Refresh the list
    } catch (error) {
        alert('Error deleting novel: ' + error.message);
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
        .replace(/'/g, "&#039;")
        .replace(/`/g, "&#96;")
        .replace(/\//g, "&#47;");
}

// Make functions available globally
// Make function available globally
window.loadNovels = loadNovels;
window.loadMyNovels = loadMyNovels;
window.createNovel = createNovel;
window.loadNovel = loadNovel;
window.incrementClicks = incrementClicks;
window.incrementLikes = incrementLikes;
window.deleteNovel = deleteNovel;