const twilio = require("twilio")

// 1. Initialize client *only if* keys exist
let client;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
} else {
  console.warn("[Twilio] Account SID or Auth Token is missing. WhatsApp notifications will be disabled.")
}

/**
 * A robust function to send a WhatsApp notification.
 * @param {string} recipientNumber - The recipient's phone number (e.g., +91xxxxxxxxxx)
 * @param {string} message - The text message to send.
 */
const sendWhatsAppNotification = async (recipientNumber, message) => {
  // 2. Check if client is initialized and all .env variables are present
  if (!client || !process.env.TWILIO_WHATSAPP_NUMBER || !recipientNumber) {
    console.error("WhatsApp notification not sent: Twilio is not fully configured or recipientNumber is missing.")
    // We don't throw an error here, just return, so we don't crash the calling function
    return
  }
  
  // 3. Add 'whatsapp:' prefix if it's not already there
  const formattedFrom = process.env.TWILIO_WHATSAPP_NUMBER.startsWith('whatsapp:')
    ? process.env.TWILIO_WHATSAPP_NUMBER
    : `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;
    
  const formattedTo = recipientNumber.startsWith('whatsapp:')
    ? recipientNumber
    : `whatsapp:${recipientNumber}`;

  try {
    const result = await client.messages.create({
      body: message,
      from: formattedFrom,
      to: formattedTo,
    })

    console.log(`[Twilio] WhatsApp message sent: ${result.sid}`)
    return result
  } catch (error) {
    // 4. Log more specific Twilio errors
    console.error("Error sending WhatsApp message:", error.message)
    if (error.code === 21614) {
      console.error(`[Twilio Error] The 'To' number (${formattedTo}) is not verified for the Twilio Sandbox. Please have that user send the join code to ${formattedFrom}.`);
    }
    // We throw the error so the calling function can handle it if needed
    throw error
  }
}

/**
 * Sends a notification to the admin when a new talent profile is submitted for review.
 * This is called from `routes/talent.js`.
 */
const notifyAdminNewTalent = async (talentName, talentEmail) => {
  const message = `New talent profile submitted on SkillX!\n\nName: ${talentName}\nEmail: ${talentEmail}\n\nReview their profile in the admin dashboard.`
  
  try {
    await sendWhatsAppNotification(process.env.ADMIN_WHATSAPP_NUMBER, message)
  } catch (error) {
    // We console.error here but don't re-throw,
    // as failing this notification shouldn't break the registration flow.
    console.error("Failed to notify admin of new talent:", error.message)
  }
}

/**
 * Sends a notification to the admin when a new hire request is submitted.
 * This is called from `routes/client.js`.
 */
const notifyAdminNewHireRequest = async (clientName, talentName) => {
  const message = `New hire request received on SkillX!\n\nClient: ${clientName}\nTalent: ${talentName}\n\nCheck details in the admin dashboard.`

  try {
    await sendWhatsAppNotification(process.env.ADMIN_WHATSAPP_NUMBER, message)
  } catch (error) {
    console.error("Failed to notify admin of new hire request:", error.message)
  }
}

/**
 * Sends a notification to the talent when their profile is approved.
 * This is called from `routes/admin.js`.
 */
const notifyTalentApproved = async (talentPhoneNumber, talentName) => {
  const message = `Congratulations ${talentName}! Your profile has been approved on SkillX. Companies can now view your profile and send you hire requests.`

  try {
    // 5. Add check for missing phone number
    if (!talentPhoneNumber) {
      console.warn(`Cannot notify ${talentName} of approval: Phone number is missing.`);
      return;
    }
    await sendWhatsAppNotification(talentPhoneNumber, message)
  } catch (error) {
    console.error("Failed to notify talent of approval:", error.message)
  }
}

/**
 * Sends a notification to the talent when their profile is rejected.
 * This is called from `routes/admin.js`.
 */
const notifyTalentRejected = async (talentPhoneNumber, talentName, reason) => {
  const message = `Hi ${talentName}, your profile on SkillX was not approved. Reason: ${reason}\n\nPlease update your profile and resubmit if you wish.`

  try {
    // 6. Add check for missing phone number
    if (!talentPhoneNumber) {
      console.warn(`Cannot notify ${talentName} of rejection: Phone number is missing.`);
      return;
    }
    await sendWhatsAppNotification(talentPhoneNumber, message)
  } catch (error) {
    console.error("Failed to notify talent of rejection:", error.message)
  }
}

module.exports = {
  sendWhatsAppNotification,
  notifyAdminNewTalent,
  notifyAdminNewHireRequest,
  notifyTalentApproved,
  notifyTalentRejected,
}

