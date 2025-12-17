---
title: Posting Resources
description: A step-by-step guide to publishing your resources on Orbis
---

# Posting Resources

This guide will walk you through the process of publishing your mods, plugins, tools, scripts, and other creations on the Orbis marketplace.

## Prerequisites

- An Orbis account
- Your resource files ready for upload (JAR, ZIP, etc.)
- Optional: Icon image (recommended 512x512px) and banner image (recommended 1920x400px)

## Creating Your Resource

The resource creation process happens in two phases: **Initial Creation** and **Configuration**.

---

## Phase 1: Initial Creation

### 1. Access the Create Resource Dialog

From your dashboard, click the **Create Resource** button.

### 2. Fill in the Initial Details

In the creation dialog, provide:

**Owner**
- Choose whether this resource belongs to you personally or one of your teams
- Only teams where you are Owner or Admin will appear

**Resource Name**
- The display name of your resource
- Example: "My Awesome Plugin"

**URL Slug**
- A unique identifier for your resource's URL
- Auto-generated from the name, or customize it
- Only lowercase letters, numbers, and hyphens
- Example: `my-awesome-plugin` → `orbis.place/plugins/my-awesome-plugin`

**Tagline**
- A short, catchy description (maximum 200 characters)
- This appears on resource cards in listings
- Example: "A powerful plugin to enhance your server"

**Resource Type**
- **Plugin**: Server-side plugins
- **Mod**: Client-side or server-side modifications
- **World**: Custom world maps
- **Data Pack**: Data modifications
- **Asset Pack**: Texture packs, models, or sounds
- **Prefab**: Pre-built structures
- **Modpack**: Collections of mods
- **Tool / Script**: External tools or automation scripts

### 3. Create as Draft

Click **Create Resource**. Your resource will be created with a **DRAFT** status, allowing you to configure it before publishing.

---

## Phase 2: Configuration & Publishing

After creation, you'll be able to access your resource's management pages at `/{type}/{slug}/manage`. Configure the following sections:

### General Settings

**Images**
- **Icon**: Upload a square image (512x512px recommended) that represents your resource
- **Banner**: Upload a wide banner image (1920x400px recommended) for the resource header

**Basic Information**
- Edit the name and tagline if needed
- Resource type cannot be changed after creation

**Pricing**
- **Free**: Users can download immediately without payment
- **Donation**: Prompt users to donate before downloading (they can skip and receive a reminder email)

**Tags**
- Search for existing tags or create new ones
- Tags help users discover your resource
- Use the autocomplete to find popular tags for your resource type

**Categories**
- Select up to 3 categories that best describe your resource
- Categories are filtered by resource type
- Examples: Gameplay, Economy, Admin Tools, etc.

### Description

Navigate to the **Description** tab to add detailed information about your resource.

- Use the rich text editor with full Markdown support
- **Paste images directly** into the editor!
- Minimum 50 characters, maximum 50,000 characters
- Include features, installation instructions, configuration guides, etc.

### Gallery

Navigate to the **Gallery** tab to showcase your resource.

- Upload multiple screenshots or preview images
- Add captions, titles, and descriptions to each image
- Drag to reorder images
- Great for showing off features and UI

### Versions

Create your first version (and future updates) through the versions management:

**Creating a Version**
- Navigate to the versions section
- Click **Create Version**
- Provide:
  - **Version Number**: e.g., `1.0.0`, `2.3.1-beta`
  - **Version Name**: Optional display name
  - **Channel**: Release, Beta, or Alpha
  - **Changelog**: Describe what's new or fixed
  - **Supported Hytale Versions**: Select compatible game versions

**Uploading Files**
- After creating a version, upload your resource files (JAR, ZIP, etc.)
- You can upload multiple files per version
- Set one file as the **primary download file**
- Optional: Add a display name for each file

### Additional Configuration

**Contributors**
- Add team members or other users who contributed to your resource

**Links**
- Add external links (source code, wiki, Discord, etc.)

**License**
- Specify the license for your resource

---

## Publishing Your Resource

Once you've configured your resource:

1. **Review all information** to ensure accuracy
2. **Upload at least one version** with a downloadable file
3. Your resource will be visible based on its status:
   - **DRAFT**: Only visible to you
   - **APPROVED**: Live and visible to everyone
   - **PENDING**: Under review
   - **REJECTED**: Not approved (you'll receive feedback)

> **Note**: The exact publication workflow may vary. Check your resource's status in the management dashboard.

---

## Managing Your Resource

After publishing, you can continue to:

- **Upload new versions** with updated files and changelogs
- **Edit descriptions and images** to keep content fresh
- **Track statistics** including downloads, views, and likes
- **Manage contributors** and permissions
- **Respond to user feedback** and issues

---

## Best Practices

**Presentation**
- Use high-quality icon and banner images
- Write clear, comprehensive descriptions
- Add multiple gallery images showcasing features

**Versioning**
- Follow semantic versioning (e.g., 1.0.0, 1.1.0, 2.0.0)
- Write detailed changelogs for each version
- Test thoroughly before uploading

**Community**
- Respond to user comments and questions
- Keep your resource updated
- Add proper documentation links

**Tags & Categories**
- Choose relevant tags that users might search for
- Select appropriate categories for better discoverability
- Use popular tags when applicable to increase visibility
