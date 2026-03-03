// Authentication functions

// Handle user login
export async function handleLogin(event) {
    event.preventDefault();
    
    if (!window.supabase) {
        alert('Supabase client not initialized');
        return;
    }
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const { data, error } = await window.supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        alert('Login successful!');
        window.location.href = 'dashboard.html';
    } catch (error) {
        alert('Error logging in: ' + error.message);
    }
}

// Handle user signup
// Handle user signup
export async function handleSignup(event) {
    event.preventDefault();
    
    if (!window.supabase) {
        alert('Supabase client not initialized');
        return;
    }
    
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    try {
        // Sign up the user
        const { data: authData, error: authError } = await window.supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username
                }
            }
        });
        
        if (authError) throw authError;
        
        if (authData.user) {
            console.log('User created:', authData.user);
            
            // Wait a moment for the auth trigger to potentially create the profile
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Try to create profile in profiles table
            const { error: profileError } = await window.supabase
                .from('profiles')
                .insert([
                    { 
                        id: authData.user.id, 
                        email: email,
                        username: username 
                    }
                ]);
            
            if (profileError) {
                console.error('Profile creation error:', profileError);
                
                // If profile already exists, that's ok
                if (profileError.code === '23505') { // Unique violation
                    console.log('Profile already exists');
                } else {
                    // Try one more time with a different approach
                    const { error: retryError } = await window.supabase
                        .from('profiles')
                        .upsert([
                            { 
                                id: authData.user.id, 
                                email: email,
                                username: username 
                            }
                        ], { onConflict: 'id' });
                    
                    if (retryError) {
                        console.error('Retry also failed:', retryError);
                    }
                }
            }
        }
        
        alert('Sign up successful! Please check your email for verification. You can now log in.');
        
        // Clear form and show login tab
        document.getElementById('signupUsername').value = '';
        document.getElementById('signupEmail').value = '';
        document.getElementById('signupPassword').value = '';
        
        showTab('login');
    } catch (error) {
        alert('Error signing up: ' + error.message);
        console.error('Signup error:', error);
    }
}

// Handle logout
export async function handleLogout() {
    try {
        if (!window.supabase) {
            throw new Error('Supabase client not initialized');
        }
        
        const { error } = await window.supabase.auth.signOut();
        if (error) throw error;
        
        window.location.href = 'index.html';
    } catch (error) {
        alert('Error logging out: ' + error.message);
    }
}

// Check user authentication status
export async function checkUser(redirectToLogin = false) {
    try {
        if (!window.supabase) {
            console.error('Supabase client not initialized');
            return null;
        }
        
        const { data: { user } } = await window.supabase.auth.getUser();
        
        // Update navigation based on auth status
        const loginLink = document.getElementById('loginLink');
        const dashboardLink = document.getElementById('dashboardLink');
        const logoutLink = document.getElementById('logoutLink');
        const createNovelBtn = document.getElementById('createNovelBtn');
        
        if (user) {
            if (loginLink) loginLink.style.display = 'none';
            if (dashboardLink) dashboardLink.style.display = 'inline';
            if (logoutLink) {
                logoutLink.style.display = 'inline';
                logoutLink.onclick = (e) => {
                    e.preventDefault();
                    handleLogout();
                };
            }
            if (createNovelBtn) createNovelBtn.style.display = 'inline-block';
            
            // Show comment form if on novel page
            const commentForm = document.getElementById('commentForm');
            if (commentForm) commentForm.style.display = 'block';
        } else {
            if (loginLink) loginLink.style.display = 'inline';
            if (dashboardLink) dashboardLink.style.display = 'none';
            if (logoutLink) logoutLink.style.display = 'none';
            if (createNovelBtn) createNovelBtn.style.display = 'none';
            
            // Hide comment form if on novel page
            const commentForm = document.getElementById('commentForm');
            if (commentForm) commentForm.style.display = 'none';
            
            if (redirectToLogin) {
                window.location.href = 'login.html';
            }
        }
        
        return user;
    } catch (error) {
        console.error('Error checking user:', error);
        return null;
    }
}

// Show login/signup tabs
export function showTab(tabName) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const tabs = document.querySelectorAll('.tab-btn');
    
    if (tabName === 'login') {
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
        tabs[0].classList.add('active');
        tabs[1].classList.remove('active');
    } else {
        loginForm.classList.remove('active');
        signupForm.classList.add('active');
        tabs[0].classList.remove('active');
        tabs[1].classList.add('active');
    }
}

// Make functions available globally for onclick handlers
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.handleLogout = handleLogout;
window.showTab = showTab;
window.checkUser = checkUser;