const { google } = require("googleapis");
const User = require("../models/UserModel");

// ✅ Define Required Scopes
const SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.appdata",
  
    'https://www.googleapis.com/auth/drive.userinfo.email',
    'https://www.googleapis.com/auth/drive.userinfo.profile'

  
];

// ✅ Initialize OAuth2 Client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// ✅ Function to Generate Authentication URL
const getAuthUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent", // Ensures refresh token is provided on every login
  });
};

// ✅ Function to Exchange Authorization Code for Tokens
const exchangeCodeForTokens = async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    return tokens;
  } catch (error) {
    console.error("Error exchanging code for tokens:", error);
    throw new Error("Failed to exchange authorization code.");
  }
};

// ✅ Function to Refresh Access Token if Expired
const refreshAccessToken = async (user) => {
  try {
    if (!user.google_refresh_token) {
      throw new Error("No refresh token available. Please log in again.");
    }

    console.log("Refreshing token using refresh token:", user.google_refresh_token);
    oauth2Client.setCredentials({ refresh_token: user.google_refresh_token });

    const { credentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(credentials);


    
    const newAccessToken = credentials.access_token;
    const newRefreshToken = credentials.refresh_token || user.google_refresh_token;

    console.log("New access token:", newAccessToken);

    await User.findByIdAndUpdate(user._id, {
      googleAccessToken: newAccessToken,
      google_refresh_token: newRefreshToken,
    });

    return newAccessToken;
  } catch (error) {
    console.error("Error refreshing token:", error.message);
    if (error.message.includes("invalid_grant")) {
      throw new Error("Refresh token has expired. Please log in again.");
    }
    throw error;
  }
};

// ✅ Function to Retrieve Access Token
const getAccessToken = async (user) => {
  if (!user.google_refresh_token) {
    throw new Error("No refresh token found. Please reauthorize.");
  }

  oauth2Client.setCredentials({ refresh_token: user.google_refresh_token });

  try {
    const { token } = await oauth2Client.getAccessToken();
    console.log("New access token generated:", token);

    if (!token) {
      console.log("Access token missing, forcing a refresh...");
      return await refreshAccessToken(user);
    }

    await User.findByIdAndUpdate(user._id, { googleAccessToken: token });
    return token;
  } catch (error) {
    console.error("Error retrieving access token:", error.message);
    if (error.message.includes("invalid_grant")) {
      throw new Error("Refresh token has expired. Please log in again.");
    }
    throw new Error("Failed to refresh access token");
  }
};

// ✅ Function to Save Document to Google Drive
const saveLetterToDrive = async (userId, letterContent, fileName = "Letter") => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const accessToken = await getAccessToken(user);
    oauth2Client.setCredentials({ access_token: accessToken });
    console.log("Using access token for Google Drive:", accessToken);

    try {
      const tokenInfo = await oauth2Client.getTokenInfo(accessToken);
      console.log("Token info:", tokenInfo);
    } catch (tokenError) {
      console.error("Invalid token:", tokenError.message);
      throw new Error("Invalid Google OAuth token");
    }

    const drive = google.drive({ version: "v3", auth: oauth2Client });
    const folderId = await findOrCreateFolder(drive, "Letters");

    const fileMetadata = {
      name: `${fileName}.docx`,
      mimeType: "application/vnd.google-apps.document",
      parents: [folderId],
    };

    const media = {
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      body: Buffer.from(letterContent, "utf-8"),
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: "id, name, webViewLink",
    });

    console.log("File uploaded successfully:", file.data);
    return { fileId: file.data.id, link: file.data.webViewLink };
  } catch (error) {
    console.error("Error saving letter to Google Drive:", error);
    throw error;
  }
};

// ✅ Function to Retrieve Letters from Google Drive
const listSavedLetters = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const accessToken = await getAccessToken(user);
    oauth2Client.setCredentials({ access_token: accessToken });
    console.log("Using access token to fetch files:", accessToken);

    const drive = google.drive({ version: "v3", auth: oauth2Client });
    const folderId = await findOrCreateFolder(drive, "Letters");

    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.document'`,
      fields: "files(id, name, webViewLink)",
    });

    console.log("Fetched files:", response.data.files);
    return response.data.files;
  } catch (error) {
    console.error("Error listing saved letters:", error);
    throw error;
  }
};

// ✅ Function to Find or Create "Letters" Folder
const findOrCreateFolder = async (drive, folderName) => {
  try {
    const query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false and 'root' in parents`;
    const response = await drive.files.list({ q: query, fields: "files(id)" });

    if (response.data.files.length > 0) {
      console.log(`Folder "${folderName}" found with ID:`, response.data.files[0].id);
      return response.data.files[0].id;
    } else {
      const folderMetadata = {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: ["root"],
      };
      const folder = await drive.files.create({ requestBody: folderMetadata, fields: "id" });
      console.log(`Folder "${folderName}" created with ID:`, folder.data.id);
      return folder.data.id;
    }
  } catch (error) {
    console.error("Error finding/creating folder:", error);
    throw error;
  }
};

// ✅ Exporting Functions
module.exports = {
  getAuthUrl,
  exchangeCodeForTokens,
  saveLetterToDrive,
  listSavedLetters,
};
