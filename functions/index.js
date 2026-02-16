const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Cloud Function to delete user from Firebase Authentication
 * Called when admin deletes a user from the website
 */
exports.deleteUserAuth = functions.https.onCall(async (data, context) => {
  // Check if the caller is an admin
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'يجب تسجيل الدخول لحذف المستخدمين'
    );
  }

  // Verify admin role
  const callerUid = context.auth.uid;
  const callerDoc = await admin.firestore().collection('users').doc(callerUid).get();
  
  if (!callerDoc.exists || callerDoc.data().role !== 'admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'ليس لديك صلاحية لحذف المستخدمين'
    );
  }

  const { userId } = data;

  if (!userId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'معرف المستخدم مطلوب'
    );
  }

  // Prevent admin from deleting themselves
  if (userId === callerUid) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'لا يمكنك حذف حسابك الخاص'
    );
  }

  try {
    // Delete user from Firebase Authentication
    await admin.auth().deleteUser(userId);
    
    console.log(`Successfully deleted user ${userId} from Authentication`);
    
    return { 
      success: true, 
      message: 'تم حذف المستخدم من Firebase Authentication بنجاح' 
    };
  } catch (error) {
    console.error('Error deleting user from Authentication:', error);
    
    // If user doesn't exist in Auth, that's okay
    if (error.code === 'auth/user-not-found') {
      return { 
        success: true, 
        message: 'المستخدم غير موجود في Authentication' 
      };
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'حدث خطأ أثناء حذف المستخدم: ' + error.message
    );
  }
});

/**
 * Automatically delete user from Authentication when deleted from Firestore
 * This is a backup in case the frontend call fails
 */
exports.onUserDeleted = functions.firestore
  .document('users/{userId}')
  .onDelete(async (snap, context) => {
    const userId = context.params.userId;
    
    try {
      await admin.auth().deleteUser(userId);
      console.log(`Auto-deleted user ${userId} from Authentication`);
    } catch (error) {
      console.error('Error auto-deleting user from Authentication:', error);
      // Don't throw error - this is just a cleanup function
    }
  });

/**
 * Scheduled function to delete messages older than 1 week
 * Runs every day at midnight
 */
exports.deleteOldMessages = functions.pubsub
  .schedule('0 0 * * *') // Run at midnight every day
  .timeZone('Africa/Cairo') // Egypt timezone
  .onRun(async (context) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    console.log(`Starting cleanup of messages older than ${oneWeekAgo.toISOString()}`);
    
    try {
      const chatsSnapshot = await admin.firestore().collection('chats').get();
      let totalDeleted = 0;
      
      for (const chatDoc of chatsSnapshot.docs) {
        const messagesQuery = await admin.firestore()
          .collection('chats')
          .doc(chatDoc.id)
          .collection('messages')
          .where('createdAt', '<', admin.firestore.Timestamp.fromDate(oneWeekAgo))
          .get();
        
        const batch = admin.firestore().batch();
        messagesQuery.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        if (messagesQuery.size > 0) {
          await batch.commit();
          totalDeleted += messagesQuery.size;
          console.log(`Deleted ${messagesQuery.size} old messages from chat ${chatDoc.id}`);
        }
      }
      
      console.log(`Cleanup complete. Total messages deleted: ${totalDeleted}`);
      return null;
    } catch (error) {
      console.error('Error deleting old messages:', error);
      return null;
    }
  });
