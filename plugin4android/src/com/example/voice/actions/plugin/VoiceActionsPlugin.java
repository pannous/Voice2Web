package com.example.voice.actions.plugin;

import java.util.Locale;

import android.app.Activity;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.Toast;

public class VoiceActionsPlugin extends Activity {

	public static final String ACTION_INTENT = "com.android.voice.ACTION";
	public static final String JEANNIE_PKG_DE = "com.pannous.voice.actions.de";
	public static final String JEANNIE_PKG = "com.pannous.voice.actions";

	private VoiceActionsTestReceiver receiver;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.main);

		// register plugin programmatically
		IntentFilter filter = new IntentFilter(ACTION_INTENT);
		receiver = new VoiceActionsTestReceiver();
		registerReceiver(receiver, filter);

		Log.i("VAPlugin", "locale:" + Locale.getDefault());
		Button b = (Button) findViewById(R.id.btn_clickme);
		b.setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				String packageName = JEANNIE_PKG_DE;
				Intent i = getPackageManager().getLaunchIntentForPackage(
						packageName);

				if (i == null) {
					Toast.makeText(getApplication(),
							"Cannot find Jeannie. Please install it!", 4);
					i = new Intent(Intent.ACTION_VIEW, Uri
							.parse("market://details?id=" + packageName));
				} else {
					i.putExtra(PluginParams.KEYWORDS, "start dictation");
					i.addCategory(Intent.CATEGORY_LAUNCHER);
				}

				VoiceActionsPlugin.this.startActivity(i);
			}
		});
	}

	@Override
	protected void onDestroy() {
		super.onDestroy();
		unregisterReceiver(receiver);
	}
}
