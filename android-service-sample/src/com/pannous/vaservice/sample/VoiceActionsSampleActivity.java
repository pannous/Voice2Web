package com.pannous.vaservice.sample;

import java.util.ArrayList;
import java.util.List;

import com.pannous.vaservice.sample.R;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.location.Location;
import android.location.LocationManager;
import android.os.Bundle;
import android.os.Handler;
import android.speech.RecognizerIntent;
import android.util.Log;
import android.view.View;
import android.view.View.OnClickListener;
import android.webkit.WebView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.SpinnerAdapter;
import android.widget.TextView;
import android.widget.Toast;

/**
 * The main voice recognition example code was taken from:
 * http://developer.android
 * .com/resources/samples/ApiDemos/src/com/example/android
 * /apis/app/VoiceRecognition.html
 */
public class VoiceActionsSampleActivity extends Activity {

	private static final String TAG = "VoiceActions";

	private static final int VOICE_RECOGNITION_REQUEST_CODE = 1234;

	private Handler mHandler;

	private WebView outVoiceActions;

	private TextView outUnderstand;

	private Spinner mSupportedLanguageView;

	private boolean manual = false;

	private VoiceActionsService va = new VoiceActionsService(10000);

	/**
	 * Called with the activity is first created.
	 */
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		mHandler = new Handler();

		// Inflate our UI from its XML layout description.
		setContentView(R.layout.main);

		// Get display items for later interaction
		Button speakButton = (Button) findViewById(R.id.btn_speak);

		outUnderstand = (EditText) findViewById(R.id.text);
		outVoiceActions = (WebView) findViewById(R.id.out_web_jeannie);

		mSupportedLanguageView = (Spinner) findViewById(R.id.supported_languages);

		Button edit = (Button) findViewById(R.id.search_button);
		edit.setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				manual = true;
				setHtml("", "");
				new VAThread(outUnderstand.getText().toString()).start();
			}
		});

		// Check to see if a recognition activity is present
		PackageManager pm = getPackageManager();
		List<ResolveInfo> activities = pm.queryIntentActivities(new Intent(
				RecognizerIntent.ACTION_RECOGNIZE_SPEECH), 0);
		if (activities.size() != 0) {
			speakButton.setOnClickListener(new OnClickListener() {

				@Override
				public void onClick(View v) {
					startVoiceRecognitionActivity();
				}
			});
		} else {
			speakButton.setEnabled(false);
			speakButton.setText("Recognizer not present");
		}

		// Most of the applications do not have to handle the voice settings. If
		// the application
		// does not require a recognition in a specific language (i.e.,
		// different from the system
		// locale), the application does not need to read the voice settings.
		refreshVoiceSettings();
	}

	/**
	 * Fire an intent to start the speech recognition activity.
	 */
	private void startVoiceRecognitionActivity() {
		manual = false;
		Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);

		// Specify the calling package to identify your application
		intent.putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, getClass()
				.getPackage().getName());

		// Display an hint to the user about what he should say.
		intent.putExtra(RecognizerIntent.EXTRA_PROMPT,
				"Speech recognition demo");

		// Given an hint to the recognizer about what the user is going to say
		intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL,
				RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);

		// Specify how many results you want to receive. The results will be
		// sorted
		// where the first result is the one with higher confidence.
		intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 5);

		// Specify the recognition language. This parameter has to be specified
		// only if the
		// recognition has to be done in a specific language and not the default
		// one (i.e., the
		// system locale). Most of the applications do not have to set this
		// parameter.
		if (!mSupportedLanguageView.getSelectedItem().toString()
				.equals("Default")) {
			intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE,
					mSupportedLanguageView.getSelectedItem().toString());
		}

		startActivityForResult(intent, VOICE_RECOGNITION_REQUEST_CODE);
	}

	/**
	 * Handle the results from the recognition activity.
	 */
	@Override
	protected void onActivityResult(int requestCode, int resultCode, Intent data) {
		if (requestCode == VOICE_RECOGNITION_REQUEST_CODE
				&& resultCode == RESULT_OK) {
			// Fill the list view with the strings the recognizer thought it
			// could have heard
			ArrayList<String> matches = data
					.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
			if (matches.isEmpty())
				outUnderstand.setText("No Input or nothing recognized");
			else {
				String inputText = matches.get(0);
				outUnderstand.setText(inputText);
				setHtml("", "");
				new VAThread(inputText).start();
			}
		}

		super.onActivityResult(requestCode, resultCode, data);
	}

	class VAThread extends Thread {
		String inputText;

		public VAThread(String txt) {
			inputText = txt;
		}

		public void run() {
			String lang = mSupportedLanguageView.getSelectedItem().toString();
			if (lang == null || lang.length() == 0)
				lang = "en";

			if (inputText == null || inputText.length() == 0)
				return;

			va.runJeannie(inputText, getLocation(), lang,
					Helper.getHashedUDID(VoiceActionsSampleActivity.this));
			setHtml(va.getText(), va.getImageUrl());
		}
	}

	public void setHtml(final String res, final String imageUrl) {
		mHandler.post(new Runnable() {

			@Override
			public void run() {
				String imageAddon = "";
				if (imageUrl.length() > 0) {
					imageAddon = "<br/><img src=\"" + imageUrl + "\">";
				}
				String header = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>";
				outVoiceActions.loadData(header + "<html><body>" + res
						+ imageAddon + "</body></html>", "text/html", "UTF-8");

				// hmmh, this would hide our result
				// if(!manual)
				// startVoiceRecognitionActivity();
			}
		});
	}

	private void refreshVoiceSettings() {
		Log.i(TAG, "Sending broadcast");
		sendOrderedBroadcast(RecognizerIntent.getVoiceDetailsIntent(this),
				null, new SupportedLanguageBroadcastReceiver(), null,
				Activity.RESULT_OK, null, null);
	}

	private void updateSupportedLanguages(List<String> languages) {
		// We add "Default" at the beginning of the list to simulate default
		// language.
		languages.add(0, "Default");
		SpinnerAdapter adapter = new ArrayAdapter<CharSequence>(this,
				android.R.layout.simple_spinner_item,
				languages.toArray(new String[languages.size()]));
		mSupportedLanguageView.setAdapter(adapter);
	}

	/**
	 * Handles the response of the broadcast request about the recognizer
	 * supported languages.
	 * 
	 * The receiver is required only if the application wants to do recognition
	 * in a specific language.
	 */
	private class SupportedLanguageBroadcastReceiver extends BroadcastReceiver {

		@Override
		public void onReceive(Context context, final Intent intent) {
			Log.i(TAG, "Receiving broadcast " + intent);

			final Bundle extra = getResultExtras(false);

			if (getResultCode() != Activity.RESULT_OK) {
				mHandler.post(new Runnable() {
					@Override
					public void run() {
						showToast("Error code:" + getResultCode());
					}
				});
			}

			if (extra == null) {
				mHandler.post(new Runnable() {
					@Override
					public void run() {
						showToast("No extra");
					}
				});
			}

			if (extra.containsKey(RecognizerIntent.EXTRA_SUPPORTED_LANGUAGES)) {
				mHandler.post(new Runnable() {

					@Override
					public void run() {
						updateSupportedLanguages(extra
								.getStringArrayList(RecognizerIntent.EXTRA_SUPPORTED_LANGUAGES));
					}
				});
			}

			if (extra.containsKey(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE)) {
				mHandler.post(new Runnable() {

					@Override
					public void run() {
						Log.i(TAG,
								"changed language to:"
										+ extra.getString(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE));
					}
				});
			}
		}

		private void showToast(String text) {
			Toast.makeText(VoiceActionsSampleActivity.this, text, 1000).show();
		}
	}

	String getLocation() {
		String location = null;
		try {
			LocationManager locationManager = (LocationManager) this
					.getSystemService(Context.LOCATION_SERVICE);
			Location l = locationManager
					.getLastKnownLocation(LocationManager.GPS_PROVIDER);
			location = l.getLatitude() + "," + l.getLongitude();
		} catch (Exception ex) {
		}
		return location;
	}
}