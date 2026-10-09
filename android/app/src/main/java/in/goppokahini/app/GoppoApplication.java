package in.goppokahini.app;

import android.app.Application;
import android.util.Log;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

public class GoppoApplication extends Application {
    private static final String TAG = "GoppoKahiniApp";

    @Override
    public void onCreate() {
        super.onCreate();

        // 1. Install Global Uncaught Exception Handler
        // Catches and suppresses any crashes originating from Firebase, FCM,
        // PushNotifications, or missing resource sounds in background/worker threads.
        final Thread.UncaughtExceptionHandler defaultHandler = Thread.getDefaultUncaughtExceptionHandler();
        Thread.setDefaultUncaughtExceptionHandler(new Thread.UncaughtExceptionHandler() {
            @Override
            public void uncaughtException(Thread thread, Throwable throwable) {
                Log.e(TAG, "Uncaught exception intercepted in thread: " + thread.getName(), throwable);
                String trace = Log.getStackTraceString(throwable);
                
                // If crash is notification or Firebase related, suppress safely to keep app running
                if (trace.contains("firebase") || 
                    trace.contains("PushNotifications") || 
                    trace.contains("notification") || 
                    trace.contains("google-services") || 
                    trace.contains("MessagingService")) {
                    Log.w(TAG, "Gracefully suppressed notification/Firebase crash: " + throwable.getMessage());
                    return;
                }

                if (defaultHandler != null) {
                    defaultHandler.uncaughtException(thread, throwable);
                }
            }
        });

        // 2. Early-initialize FirebaseApp with safety fallback
        try {
            if (FirebaseApp.getApps(this).isEmpty()) {
                FirebaseApp.initializeApp(this);
                Log.i(TAG, "FirebaseApp auto-initialized successfully.");
            }
        } catch (Exception e) {
            Log.w(TAG, "Default FirebaseApp init notice: " + e.getMessage());
            try {
                FirebaseOptions options = new FirebaseOptions.Builder()
                    .setApplicationId("1:346121043543:android:197ddfc62dbf723335ed12")
                    .setProjectId("argon-yarrow-wpthm")
                    .setApiKey("AIzaSyCHlAZ0cvWnbkpo9N7TTh7VBHPEo6jCP5U")
                    .setGcmSenderId("346121043543")
                    .setStorageBucket("argon-yarrow-wpthm.firebasestorage.app")
                    .build();
                FirebaseApp.initializeApp(this, options);
                Log.i(TAG, "FirebaseApp explicitly initialized with safe options.");
            } catch (Exception ex2) {
                Log.w(TAG, "Firebase explicit init notice: " + ex2.getMessage());
            }
        }
    }
}
