package com.example.voice.actions.plugin;

import static com.example.voice.actions.plugin.PluginParams.*;

import android.content.*;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;

public class VoiceActionsTestReceiver extends BroadcastReceiver {

	/**
	 * SAY the keyword to activate this plugin!
	 */
	final String keyword = "test";

	final String source = "http://test.com";

	/**
	 * Don't do any work here, just call an intent as its called on the UI
	 * thread as usual.
	 */
	@Override
	public void onReceive(Context context, Intent intent) {
		try {
			// what did Jeannie hear?
			// SpeechRecognizer.RESULTS_RECOGNITION
			String input = intent.getStringExtra("input");
			Log.e("VoiceActionsTestReceiver", "received " + input);

			Bundle results = getResultExtras(true);

			// only handle OUR keywords
			if (input == null || !input.contains(keyword))
				return;

			// already handled? some other app was faster
			if (results.getBoolean(HANDLED, false))
				return;

			results.putBoolean(HANDLED, true);
			results.putString(HANDLED_BY, "VoiceActionsTestReceiver");
			results.putString(RESPONSE, "3rd party plugin test ok");
			// tell Jeannie what to do
			results.putString(ACTION, "hide");

			// perform our action. ONLY via intent / thread !
			String intent0 = Intent.ACTION_VIEW;
			Intent action = new Intent(intent0);
			intent.setData(Uri.parse(source));
			context.startActivity(action);

			// method has to return after .2 seconds!!! don't do any work here,
			// just start an intent!
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

}
