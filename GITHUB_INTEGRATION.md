# GitHub Issues Integration Setup

## 🚀 Overview

The Treatment Manager now includes a built-in issue reporting system that automatically creates GitHub issues in your repository. Users can report bugs, request features, and suggest enhancements directly from the application.

## 📋 Prerequisites

1. **GitHub Repository**: You need a GitHub repository to receive issues
2. **GitHub Personal Access Token**: For API authentication
3. **Environment Configuration**: Backend environment variables

## 🔧 Setup Instructions

### 1. Create a GitHub Personal Access Token

1. Go to **GitHub.com** → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Click **"Generate new token (classic)"**
3. Set the following:
   - **Note**: "Treatment Manager Issue Reporting"
   - **Expiration**: Choose appropriate duration (90 days recommended)
   - **Scopes**: Select `repo` (Full control of private repositories)
4. Click **"Generate token"**
5. **IMPORTANT**: Copy the token immediately (it won't be shown again)

### 2. Configure Environment Variables

Add these to your backend `.env` file:

```bash
# GitHub Integration
GITHUB_TOKEN=ghp_your_personal_access_token_here
GITHUB_REPO=YourUsername/your-repository-name

# Example:
# GITHUB_TOKEN=ghp_abcdefghijklmnopqrstuvwxyz1234567890
# GITHUB_REPO=ButterflyEA/treatments_manager
```

### 3. Repository Setup (Optional but Recommended)

Create these labels in your GitHub repository for better organization:

```bash
# Priority Labels
priority:low (color: #28a745)
priority:medium (color: #ffc107)  
priority:high (color: #dc3545)

# Type Labels
type:bug (color: #d73a49)
type:feature (color: #0366d6)
type:enhancement (color: #7c3aed)

# Source Label
user-reported (color: #6f42c1)
```

## 🎯 Features

### Issue Types
- **🐛 Bug Report**: For reporting application bugs
- **✨ Feature Request**: For requesting new functionality
- **🚀 Enhancement**: For suggesting improvements

### Priority Levels
- **🟢 Low**: Minor issues, nice-to-have features
- **🟡 Medium**: Standard priority items
- **🔴 High**: Critical bugs, important features

### Automatic Labels
Issues are automatically tagged with:
- `type:bug` / `type:feature` / `type:enhancement`
- `priority:low` / `priority:medium` / `priority:high`
- `user-reported`

## 🔍 Testing the Integration

### Check Health Status
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8080/api/v1/github/health
```

Expected response:
```json
{
  "github_integration": "configured",
  "repository": "YourUsername/repository-name",
  "status": "ready"
}
```

### Test Issue Creation
1. Start your backend server
2. Login to the application
3. Navigate to the "Report Issue" page
4. Fill out the form and submit
5. Check your GitHub repository for the new issue

## 🚨 Troubleshooting

### Common Issues

1. **"GitHub integration not configured"**
   - Ensure `GITHUB_TOKEN` environment variable is set
   - Restart the backend server after adding the token

2. **"GitHub API error: 401"**
   - Check if your token is valid and hasn't expired
   - Ensure the token has `repo` scope permissions

3. **"GitHub API error: 404"**
   - Verify the `GITHUB_REPO` format: `owner/repository-name`
   - Ensure the repository exists and token has access

4. **"Failed to connect to GitHub API"**
   - Check your internet connection
   - Verify firewall settings allow outbound HTTPS connections

### Debug Mode

Enable debug logging to see detailed error messages:

```bash
# In your .env file
RUST_LOG=debug
```

## 🔒 Security Considerations

1. **Token Security**:
   - Never commit tokens to version control
   - Use environment variables only
   - Set appropriate token expiration dates
   - Consider using GitHub Apps for production

2. **Rate Limiting**:
   - GitHub API has rate limits (5000 requests/hour for authenticated users)
   - The app doesn't currently implement rate limiting checks

3. **Validation**:
   - All issue content is sanitized
   - User authentication is required to create issues

## 📝 Issue Template

Created issues follow this format:

```markdown
[User's description]

---

**Issue Details:**
- Type: bug/feature/enhancement
- Priority: low/medium/high
- Reported via: Treatment Manager System
```

## 🎉 Usage Guide

1. **Navigate**: Click "📝 Report Issue" in the navigation
2. **Select Type**: Choose Bug Report, Feature Request, or Enhancement
3. **Set Priority**: Select Low, Medium, or High priority
4. **Title**: Write a clear, descriptive title
5. **Description**: Provide detailed information
6. **Submit**: Click "Create Issue"
7. **Track**: Use the GitHub link to follow the issue

The system provides immediate feedback and includes a direct link to view the created issue on GitHub.

## 🔄 Future Enhancements

Potential improvements to consider:
- Issue search and listing within the app
- Status synchronization from GitHub
- Comment system integration
- Bulk issue operations
- Custom issue templates
- Integration with project boards
