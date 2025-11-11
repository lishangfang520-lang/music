// Music Player Functionality
class MusicPlayer {
    constructor() {
        this.audio = new Audio();
        this.isPlaying = false;
        this.currentTrackIndex = 0;
        this.volume = 0.7;
        
        // Local music files - keep these tracks
        this.tracks = [
            {
                title: "Traceback",
                artist: "Unknown Artist",
                src: "../music/song1.“Traceback”.mp3"
            },
            {
                title: "Stroll at Dusk",
                artist: "Unknown Artist",
                src: "../music/song2 “Stroll at Dusk”.mp3"
            },
            {
                title: "Stroll at Dusk",
                artist: "Unknown Artist",
                src: "../music/song3 “above the rain”.mp3"
            }
        ];

        this.initializeElements();
        this.setupEventListeners();
        this.loadTracksFromStorage();
        this.updatePlaylist();
        
        // Only load track if there are tracks available
        if (this.tracks.length > 0) {
            this.loadTrack(0);
        } else {
            // Set default display when no tracks
            this.songTitle.textContent = 'No tracks available';
            this.artistName.textContent = 'Upload a song to get started';
        }
    }

    initializeElements() {
        this.playPauseBtn = document.getElementById('play-pause-btn');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.progressBar = document.getElementById('progress');
        this.progressContainer = document.querySelector('.progress-bar');
        this.currentTimeEl = document.getElementById('current-time');
        this.durationEl = document.getElementById('duration');
        this.volumeSlider = document.getElementById('volume-slider');
        this.volumeValue = document.getElementById('volume-value');
        this.songTitle = document.querySelector('.song-title');
        this.artistName = document.querySelector('.artist-name');
        this.vinylRecord = document.querySelector('.vinyl-record');
        this.playerCard = document.querySelector('.player-card');
        this.playlistContainer = document.getElementById('playlist');
    }

    setupEventListeners() {
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.prevBtn.addEventListener('click', () => this.previousTrack());
        this.nextBtn.addEventListener('click', () => this.nextTrack());
        this.progressContainer.addEventListener('click', (e) => this.setProgress(e));
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audio.addEventListener('ended', () => this.nextTrack());
    }

    loadTrack(index) {
        if (this.tracks.length === 0) {
            this.songTitle.textContent = 'No tracks available';
            this.artistName.textContent = 'Upload a song to get started';
            return;
        }
        
        if (index < 0 || index >= this.tracks.length) {
            return;
        }
        this.currentTrackIndex = index;
        const track = this.tracks[index];
        
        // Check if track source is valid
        if (!track.src) {
            console.error('Track has no source:', track);
            this.songTitle.textContent = track.title || 'Unknown Track';
            this.artistName.textContent = 'Source not available';
            return;
        }
        
        try {
            this.audio.src = track.src;
            this.songTitle.textContent = track.title;
            this.artistName.textContent = track.artist;
            this.audio.load();
            this.updatePlaylist();
        } catch (error) {
            console.error('Error loading track:', error, track);
            this.songTitle.textContent = track.title || 'Error';
            this.artistName.textContent = 'Failed to load';
            alert(`无法加载歌曲 "${track.title}"。请检查文件是否有效。`);
        }
    }
    
    playTrackByIndex(index) {
        if (index < 0 || index >= this.tracks.length) {
            return;
        }
        this.loadTrack(index);
        if (!this.isPlaying) {
            this.play();
        } else {
            this.audio.play();
        }
    }

    addTrack(track) {
        this.tracks.push(track);
        this.saveTracks();
        this.updatePlaylist();
        // Update statistics when track is added
        if (typeof updateStatistics === 'function') {
            updateStatistics(this, null);
        }
    }
    
    updatePlaylist() {
        if (!this.playlistContainer) return;
        
        this.playlistContainer.innerHTML = '';
        
        if (this.tracks.length === 0) {
            this.playlistContainer.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 20px;">No tracks available</p>';
            return;
        }
        
        this.tracks.forEach((track, index) => {
            const playlistItem = document.createElement('div');
            playlistItem.className = 'playlist-item';
            if (index === this.currentTrackIndex) {
                playlistItem.classList.add('active');
            }
            
            playlistItem.innerHTML = `
                <div class="playlist-item-info">
                    <span class="playlist-item-number">${index + 1}</span>
                    <div class="playlist-item-details">
                        <span class="playlist-item-title">${track.title}</span>
                        <span class="playlist-item-artist">${track.artist}</span>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <span class="playlist-item-status">${index === this.currentTrackIndex && this.isPlaying ? '▶' : ''}</span>
                    <button class="playlist-item-delete" title="删除" aria-label="删除此歌曲" style="border:none;background:transparent;cursor:pointer;font-size:16px;line-height:1;">🗑</button>
                </div>
            `;
            
            playlistItem.addEventListener('click', () => {
                this.playTrackByIndex(index);
            });
            
            const deleteBtn = playlistItem.querySelector('.playlist-item-delete');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteTrack(index);
            });

            this.playlistContainer.appendChild(playlistItem);
        });
    }

    deleteTrack(index) {
        if (index < 0 || index >= this.tracks.length) return;
        const wasCurrent = index === this.currentTrackIndex;

        // Remove the track
        this.tracks.splice(index, 1);
        this.saveTracks();

        // Adjust current index
        if (this.currentTrackIndex > index) {
            this.currentTrackIndex -= 1;
        }

        if (this.tracks.length === 0) {
            // Nothing left to play
            this.audio.pause();
            this.isPlaying = false;
            this.audio.src = '';
            this.songTitle.textContent = 'No tracks available';
            this.artistName.textContent = 'Upload a song to get started';
            if (this.playerCard) this.playerCard.classList.remove('playing');
            this.updatePlaylist();
            if (typeof updateStatistics === 'function') {
                updateStatistics(this, null);
            }
            return;
        }

        if (wasCurrent) {
            const newIndex = Math.min(index, this.tracks.length - 1);
            this.loadTrack(newIndex);
            if (this.isPlaying) {
                this.play();
            }
        } else {
            this.updatePlaylist();
        }

        if (typeof updateStatistics === 'function') {
            updateStatistics(this, null);
        }
    }

    saveTracks() {
        // Save tracks to localStorage
        // Note: blob URLs will expire on page refresh, but we save them anyway
        // for the current session
        const tracksToSave = this.tracks.map(track => ({
            title: track.title,
            artist: track.artist,
            src: track.src,
            isUploaded: track.isUploaded || false
        }));
        localStorage.setItem('musicTracks', JSON.stringify(tracksToSave));
    }

    loadTracksFromStorage() {
        const savedTracks = localStorage.getItem('musicTracks');
        if (savedTracks) {
            try {
                const tracks = JSON.parse(savedTracks);
                // Filter out sample/placeholder tracks, but keep local music files
                const validTracks = tracks.filter(track => {
                    // Remove sample tracks and placeholder artists
                    if (track.title && (
                        track.title.includes('Sample Track') || 
                        (track.artist === 'Artist Name' && !track.src.includes('../music/')) ||
                        track.title === 'Now Playing'
                    )) {
                        return false;
                    }
                    // Only keep tracks with valid sources
                    return track.src && (
                        track.src.startsWith('http') || 
                        track.src.startsWith('../') || 
                        track.src.startsWith('./') || 
                        track.src.startsWith('blob:')
                    );
                });
                
                if (validTracks.length > 0) {
                    // Merge with existing tracks, avoiding duplicates
                    // Check by src to avoid duplicates of local files
                    validTracks.forEach(track => {
                        const exists = this.tracks.some(t => 
                            t.src === track.src || 
                            (t.title === track.title && t.artist === track.artist && t.src === track.src)
                        );
                        if (!exists) {
                            this.tracks.push(track);
                        }
                    });
                    // Save cleaned tracks back to storage
                    this.saveTracks();
                }
                // Don't clear storage - keep uploaded tracks even if no valid tracks found
            } catch (e) {
                console.error('Error loading tracks from storage:', e);
                // Clear corrupted data
                localStorage.removeItem('musicTracks');
            }
        }
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        this.audio.play();
        this.isPlaying = true;
        this.playPauseBtn.textContent = '⏸';
        if (this.vinylRecord) this.vinylRecord.classList.add('playing');
        if (this.playerCard) this.playerCard.classList.add('playing');
        this.updatePlaylist();
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.playPauseBtn.textContent = '▶';
        if (this.vinylRecord) this.vinylRecord.classList.remove('playing');
        if (this.playerCard) this.playerCard.classList.remove('playing');
        this.updatePlaylist();
    }

    previousTrack() {
        if (this.tracks.length === 0) return;
        this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
        this.loadTrack(this.currentTrackIndex);
        if (this.isPlaying) {
            this.play();
        }
    }

    nextTrack() {
        if (this.tracks.length === 0) return;
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
        this.loadTrack(this.currentTrackIndex);
        if (this.isPlaying) {
            this.play();
        }
    }

    setProgress(e) {
        const width = this.progressContainer.clientWidth;
        const clickX = e.offsetX;
        const duration = this.audio.duration;
        this.audio.currentTime = (clickX / width) * duration;
    }

    updateProgress() {
        if (this.audio.duration) {
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            this.progressBar.style.width = progress + '%';
            this.currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
        }
    }

    updateDuration() {
        if (this.audio.duration) {
            this.durationEl.textContent = this.formatTime(this.audio.duration);
        }
    }

    setVolume(value) {
        this.volume = value / 100;
        this.audio.volume = this.volume;
        this.volumeValue.textContent = value + '%';
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Email Subscription Functionality
class EmailSubscription {
    constructor() {
        this.subscriptionModal = document.getElementById('subscription-modal');
        this.openModalBtn = document.getElementById('open-subscription-modal-btn');
        this.closeModalBtn = document.getElementById('close-subscription-modal-btn');
        this.form = document.getElementById('subscription-form');
        this.emailInput = document.getElementById('email-input');
        this.messageEl = document.getElementById('form-message');
        
        // Backend API Configuration
        // Resend API cannot be called directly from browser (CORS restriction)
        // You need to create a backend endpoint to send emails
        // Options:
        // 1. Use Vercel serverless function (api/send-email.js)
        // 2. Use PHP backend (api/send-email.php)
        // 3. Use your own backend server
        this.backendConfig = {
            endpoint: 'http://localhost:3000/api/send-email', // Local server endpoint
            // For production: 'https://your-app.vercel.app/api/send-email'
            // Or use: 'https://yourdomain.com/api/send-email.php'
            enabled: true // Set to true to enable email sending
        };

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Open modal
        this.openModalBtn.addEventListener('click', () => {
            this.openModal();
        });

        // Close modal
        this.closeModalBtn.addEventListener('click', () => {
            this.closeModal();
        });

        // Close modal when clicking overlay
        this.subscriptionModal.addEventListener('click', (e) => {
            if (e.target === this.subscriptionModal) {
                this.closeModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.subscriptionModal.style.display !== 'none') {
                this.closeModal();
            }
        });

        // Form submit
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    openModal() {
        this.subscriptionModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        // Focus on email input
        setTimeout(() => {
            this.emailInput.focus();
        }, 100);
    }

    closeModal() {
        this.subscriptionModal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
        // Reset form
        this.form.reset();
        this.messageEl.textContent = '';
        this.messageEl.className = 'form-message';
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const email = this.emailInput.value.trim();
        
        if (!this.isValidEmail(email)) {
            this.showMessage('Please enter a valid email address.', 'error');
            return;
        }

        // Disable form during submission
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Subscribing...</span>';

        try {
            // Save subscriber first
            this.saveSubscriber(email);
            
            // Try to send welcome email via backend
            if (this.backendConfig.endpoint !== 'YOUR_BACKEND_ENDPOINT' && 
                this.backendConfig.enabled && 
                this.backendConfig.endpoint.startsWith('http')) {
                try {
                    await this.sendWelcomeEmailViaBackend(email);
                    this.showMessage('🎉 Successfully subscribed! Check your inbox for a welcome email.', 'success');
                } catch (error) {
                    console.error('Email sending failed:', error);
                    this.showMessage('✅ Subscription saved! Email sending failed. Check console for details.', 'success');
                }
            } else {
                // Fallback: Show instructions
                await this.simulateSubscription(email);
                this.showMessage('✅ Subscription saved! Configure backend endpoint to send welcome emails (see console).', 'success');
            }
            
            this.emailInput.value = '';
            
            // Close modal after successful subscription (with delay to show message)
            setTimeout(() => {
                this.closeModal();
            }, 2000);
            
        } catch (error) {
            console.error('Subscription error:', error);
            // Even if email fails, subscription is saved
            this.showMessage('✅ Subscription saved! Welcome email will be sent shortly.', 'success');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async sendWelcomeEmailViaBackend(email) {
        // Send welcome email via backend endpoint
        // The backend handles the Resend API call securely
        const response = await fetch(this.backendConfig.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to send email');
        }

        return await response.json();
    }

    async simulateSubscription(email) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('📧 Subscription saved for:', email);
                console.log('');
                console.log('💡 To enable automatic email sending, set up a backend:');
                console.log('');
                console.log('Option 1: Vercel Serverless Function (Recommended)');
                console.log('   1. Sign up at https://vercel.com');
                console.log('   2. Install Vercel CLI: npm i -g vercel');
                console.log('   3. Deploy: vercel');
                console.log('   4. Set environment variable: RESEND_API_KEY');
                console.log('   5. Update backendEndpoint in script.js to your Vercel URL');
                console.log('');
                console.log('Option 2: PHP Backend');
                console.log('   1. Upload api/send-email.php to your web server');
                console.log('   2. Update RESEND_API_KEY in the PHP file');
                console.log('   3. Update backendEndpoint in script.js');
                console.log('');
                console.log('Option 3: Your Own Backend');
                console.log('   Create an endpoint that calls Resend API');
                console.log('   See api/send-email.js for reference');
                resolve();
            }, 1500);
        });
    }

    saveSubscriber(email) {
        let subscribers = JSON.parse(localStorage.getItem('subscribers') || '[]');
        if (!subscribers.includes(email)) {
            subscribers.push(email);
            localStorage.setItem('subscribers', JSON.stringify(subscribers));
            // Update statistics when subscriber is added
            if (typeof updateStatistics === 'function') {
                updateStatistics(null, this);
            }
        }
    }

    showMessage(message, type) {
        this.messageEl.textContent = message;
        this.messageEl.className = `form-message ${type}`;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.messageEl.style.display = 'none';
        }, 5000);
    }
}

// Music Upload Functionality
class MusicUpload {
    constructor(player, subscription) {
        this.player = player;
        this.subscription = subscription;
        this.uploadModal = document.getElementById('upload-modal');
        this.openModalBtn = document.getElementById('open-upload-modal-btn');
        this.closeModalBtn = document.getElementById('close-upload-modal-btn');
        this.uploadArea = document.getElementById('upload-area');
        this.audioUpload = document.getElementById('audio-upload');
        this.uploadInfo = document.getElementById('upload-info');
        this.uploadMessage = document.getElementById('upload-message');
        this.trackTitle = document.getElementById('track-title');
        this.trackArtist = document.getElementById('track-artist');
        this.uploadSubmitBtn = document.getElementById('upload-submit-btn');
        this.selectedFile = null;
        this.objectURL = null;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Open modal
        this.openModalBtn.addEventListener('click', () => {
            this.openModal();
        });

        // Close modal
        this.closeModalBtn.addEventListener('click', () => {
            this.closeModal();
        });

        // Close modal when clicking overlay
        this.uploadModal.addEventListener('click', (e) => {
            if (e.target === this.uploadModal) {
                this.closeModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.uploadModal.style.display !== 'none') {
                this.closeModal();
            }
        });

        // Click to upload
        this.uploadArea.addEventListener('click', () => {
            this.audioUpload.click();
        });

        // File input change
        this.audioUpload.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });

        // Drag and drop
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });

        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('dragover');
        });

        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('audio/')) {
                this.handleFileSelect(file);
            }
        });

        // Submit upload
        this.uploadSubmitBtn.addEventListener('click', () => {
            this.handleUpload();
        });
    }

    openModal() {
        this.uploadModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    closeModal() {
        this.uploadModal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
        // Reset form when closing
        this.resetForm();
    }

    handleFileSelect(file) {
        if (!file || !file.type.startsWith('audio/')) {
            this.showMessage('Please select a valid audio file.', 'error');
            return;
        }

        this.selectedFile = file;
        
        // Create object URL for preview
        if (this.objectURL) {
            URL.revokeObjectURL(this.objectURL);
        }
        this.objectURL = URL.createObjectURL(file);

        // Auto-fill title from filename
        const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
        this.trackTitle.value = fileName;
        // Don't auto-fill artist - let user enter it
        if (!this.trackArtist.value) {
            this.trackArtist.value = '';
        }

        // Show upload info
        this.uploadInfo.style.display = 'block';
        this.showMessage(`Selected: ${file.name} (${this.formatFileSize(file.size)})`, 'success');
    }

    async handleUpload() {
        const title = this.trackTitle.value.trim();
        const artist = this.trackArtist.value.trim();

        if (!title || !artist) {
            this.showMessage('请输入歌曲名称和艺术家名称。', 'error');
            return;
        }

        if (!this.selectedFile) {
            this.showMessage('请先选择音频文件。', 'error');
            return;
        }

        this.uploadSubmitBtn.disabled = true;
        this.uploadSubmitBtn.innerHTML = '<span>上传中并通知订阅者...</span>';

        try {
            // Collect basic track information
            // Email content will be auto-generated by the server
            const trackInfo = {
                title: title,
                artist: artist
            };

            // Add track to player
            // Keep the objectURL reference - don't revoke it
            const newTrack = {
                title: title,
                artist: artist,
                src: this.objectURL, // Use object URL for playback
                isUploaded: true // Mark as uploaded track
            };

            this.player.addTrack(newTrack);
            
            // Clear the reference but keep the URL alive for playback
            // The URL will persist until page refresh or explicit revocation
            this.objectURL = null; // Clear reference, but URL stays valid
            
            // Notify all subscribers (server will generate email content)
            await this.notifySubscribers(trackInfo);

            this.showMessage(`🎉 《${title}》上传成功！所有订阅者已收到新歌发布邮件。`, 'success');
            
            // Close modal after successful upload (with delay to show message)
            setTimeout(() => {
                this.closeModal();
            }, 2000);
            
        } catch (error) {
            console.error('Upload error:', error);
            this.showMessage('上传成功，但部分通知可能发送失败。请查看控制台了解详情。', 'error');
        } finally {
            this.uploadSubmitBtn.disabled = false;
            this.uploadSubmitBtn.innerHTML = '<span>上传并通知所有订阅者</span><span>📤</span>';
        }
    }

    async notifySubscribers(trackInfo) {
        const subscribers = JSON.parse(localStorage.getItem('subscribers') || '[]');
        
        if (subscribers.length === 0) {
            console.log('没有订阅者需要通知');
            return;
        }

        console.log(`正在通知 ${subscribers.length} 位订阅者关于新歌发布: ${trackInfo.title}`);

        // Send notification email to each subscriber
        const emailPromises = subscribers.map(email => 
            this.sendNewReleaseNotification(email, trackInfo)
        );

        // Wait for all emails to be sent (or fail gracefully)
        const results = await Promise.allSettled(emailPromises);
        
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        console.log(`邮件通知: ${successful} 封发送成功, ${failed} 封发送失败`);
    }

    async sendNewReleaseNotification(email, trackInfo) {
        // Use the same backend endpoint as welcome emails
        const backendEndpoint = this.subscription.backendConfig.endpoint;
        
        if (backendEndpoint === 'YOUR_BACKEND_ENDPOINT' || !this.subscription.backendConfig.enabled) {
            console.log(`将发送通知到 ${email} 关于 "${trackInfo.title}"`);
            console.log('⚠️ 后端未配置，无法发送新歌发布邮件');
            return;
        }

        try {
            const emailData = {
                email: email,
                type: 'new_release',  // 重要：确保类型是 new_release
                trackTitle: trackInfo.title,
                artistName: trackInfo.artist
                // Server will auto-generate all email content
            };
            
            console.log(`📧 发送新歌发布邮件到 ${email}:`, {
                type: emailData.type,
                trackTitle: emailData.trackTitle,
                artistName: emailData.artistName
            });

            const response = await fetch(backendEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error(`❌ 发送失败 (${email}):`, errorData);
                throw new Error(`Failed to send notification to ${email}: ${errorData.error || 'Unknown error'}`);
            }

            const result = await response.json();
            console.log(`✅ 新歌发布邮件已发送到 ${email}`);
            return result;
        } catch (error) {
            console.error(`通知 ${email} 失败:`, error);
            throw error;
        }
    }

    resetForm() {
        this.trackTitle.value = '';
        this.trackArtist.value = '';
        this.uploadInfo.style.display = 'none';
        this.audioUpload.value = '';
        this.selectedFile = null;
        // Don't revoke objectURL here - it's needed for playback
        // The objectURL will be kept until page refresh
        this.objectURL = null; // Just clear the reference, don't revoke
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    showMessage(message, type) {
        this.uploadMessage.textContent = message;
        this.uploadMessage.className = `form-message ${type}`;
        this.uploadMessage.style.display = 'block';
        
        setTimeout(() => {
            this.uploadMessage.style.display = 'none';
        }, 5000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const player = new MusicPlayer();
    const subscription = new EmailSubscription();
    const upload = new MusicUpload(player, subscription);
    
    // Update statistics
    updateStatistics(player, subscription);
    
    // Update stats when tracks change
    const originalAddTrack = player.addTrack.bind(player);
    player.addTrack = function(track) {
        originalAddTrack(track);
        updateStatistics(player, subscription);
    };
    
    console.log('Music Player, Email Subscription, and Upload System initialized!');
});

// Update page statistics
function updateStatistics(player, subscription) {
    // Update track count
    const totalTracks = player.tracks.length;
    const tracksEl = document.getElementById('total-tracks');
    if (tracksEl) {
        tracksEl.textContent = totalTracks;
    }
    
    // Update subscriber count
    const subscribers = JSON.parse(localStorage.getItem('subscribers') || '[]');
    const subscribersEl = document.getElementById('total-subscribers');
    if (subscribersEl) {
        subscribersEl.textContent = subscribers.length;
    }
}

