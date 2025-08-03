
export interface SocialMediaConfig {
  instagram: {
    accessToken?: string;
    connected: boolean;
  };
  youtube: {
    accessToken?: string;
    refreshToken?: string;
    connected: boolean;
  };
  tiktok: {
    accessToken?: string;
    connected: boolean;
  };
  facebook: {
    accessToken?: string;
    pageId?: string;
    connected: boolean;
  };
}

export class SocialMediaService {
  private static instance: SocialMediaService;
  private config: SocialMediaConfig = {
    instagram: { connected: false },
    youtube: { connected: false },
    tiktok: { connected: false },
    facebook: { connected: false }
  };

  static getInstance(): SocialMediaService {
    if (!SocialMediaService.instance) {
      SocialMediaService.instance = new SocialMediaService();
    }
    return SocialMediaService.instance;
  }

  // Validate API credentials on startup
  validateCredentials() {
    const requiredEnvVars = [
      'YOUTUBE_CLIENT_ID',
      'YOUTUBE_CLIENT_SECRET', 
      'INSTAGRAM_APP_ID',
      'INSTAGRAM_APP_SECRET',
      'FACEBOOK_APP_ID',
      'FACEBOOK_APP_SECRET',
      'TIKTOK_CLIENT_KEY',
      'TIKTOK_CLIENT_SECRET'
    ];

    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missing.length > 0) {
      console.warn('Missing environment variables for social media APIs:', missing);
      console.warn('Please check your .env file and API_SETUP.md for configuration instructions');
    }

    return missing.length === 0;
  }

  getConnectionStatus() {
    return {
      instagram: this.config.instagram.connected,
      youtube: this.config.youtube.connected,
      tiktok: this.config.tiktok.connected,
      facebook: this.config.facebook.connected
    };
  }

  async connectInstagram(accessToken: string): Promise<boolean> {
    try {
      // Validate Instagram token
      const response = await fetch(`https://graph.instagram.com/me?access_token=${accessToken}`);
      if (response.ok) {
        this.config.instagram.accessToken = accessToken;
        this.config.instagram.connected = true;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Instagram connection error:', error);
      return false;
    }
  }

  async connectYouTube(accessToken: string, refreshToken: string): Promise<boolean> {
    try {
      // Validate YouTube token
      const response = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (response.ok) {
        this.config.youtube.accessToken = accessToken;
        this.config.youtube.refreshToken = refreshToken;
        this.config.youtube.connected = true;
        return true;
      }
      return false;
    } catch (error) {
      console.error('YouTube connection error:', error);
      return false;
    }
  }

  async connectTikTok(accessToken: string): Promise<boolean> {
    try {
      // TikTok API validation would go here
      this.config.tiktok.accessToken = accessToken;
      this.config.tiktok.connected = true;
      return true;
    } catch (error) {
      console.error('TikTok connection error:', error);
      return false;
    }
  }

  async connectFacebook(accessToken: string, pageId: string): Promise<boolean> {
    try {
      // Validate Facebook token
      const response = await fetch(`https://graph.facebook.com/me?access_token=${accessToken}`);
      if (response.ok) {
        this.config.facebook.accessToken = accessToken;
        this.config.facebook.pageId = pageId;
        this.config.facebook.connected = true;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Facebook connection error:', error);
      return false;
    }
  }

  disconnect(platform: keyof SocialMediaConfig) {
    this.config[platform].connected = false;
    delete this.config[platform].accessToken;
  }

  async postToInstagram(videoPath: string, caption: string): Promise<boolean> {
    if (!this.config.instagram.connected || !this.config.instagram.accessToken) {
      throw new Error('Instagram not connected');
    }
    // Instagram posting logic would go here
    return true;
  }

  async postToYouTube(videoPath: string, title: string, description: string): Promise<boolean> {
    if (!this.config.youtube.connected || !this.config.youtube.accessToken) {
      throw new Error('YouTube not connected');
    }
    // YouTube posting logic would go here
    return true;
  }

  async postToTikTok(videoPath: string, description: string): Promise<boolean> {
    if (!this.config.tiktok.connected || !this.config.tiktok.accessToken) {
      throw new Error('TikTok not connected');
    }
    // TikTok posting logic would go here
    return true;
  }

  async postToFacebook(videoPath: string, description: string): Promise<boolean> {
    if (!this.config.facebook.connected || !this.config.facebook.accessToken) {
      throw new Error('Facebook not connected');
    }
    // Facebook posting logic would go here
    return true;
  }
}
