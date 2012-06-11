package com.pannous.vaservice.sample;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Random;
import java.util.UUID;

import android.app.Activity;
import android.content.Context;
import android.telephony.TelephonyManager;

public class Helper {

	private static UUID fallbackId;

	public static String streamToString(InputStream is, String encoding)
			throws IOException {
		try {
			byte[] buffer = new byte[1024];
			ByteArrayOutputStream outStream = new ByteArrayOutputStream(
					buffer.length);
			int numRead;
			while ((numRead = is.read(buffer)) != -1) {
				outStream.write(buffer, 0, numRead);
			}
			return outStream.toString(encoding);
		} finally {
			is.close();
		}
	}

	public static String getHashedUDID(Activity act) {
		try {
			android.telephony.TelephonyManager tm = (TelephonyManager) act
					.getSystemService(Context.TELEPHONY_SERVICE);
			return SHA1(tm.getDeviceId());
		} catch (Exception ex) {
			if (fallbackId == null)
				fallbackId = UUID.randomUUID();
			return fallbackId.toString();
		}
	}

	private static String convertToHex(byte[] data) {
		StringBuilder buf = new StringBuilder();
		for (int i = 0; i < data.length; i++) {
			int halfbyte = (data[i] >>> 4) & 0x0F;
			int two_halfs = 0;
			do {
				if ((0 <= halfbyte) && (halfbyte <= 9))
					buf.append((char) ('0' + halfbyte));
				else
					buf.append((char) ('a' + (halfbyte - 10)));
				halfbyte = data[i] & 0x0F;
			} while (two_halfs++ < 1);
		}
		return buf.toString();
	}

	public static String SHA1(String text) throws NoSuchAlgorithmException,
			UnsupportedEncodingException {
		MessageDigest md = MessageDigest.getInstance("SHA-1");
		md.update(text.getBytes(), 0, text.length());
		byte[] sha1hash = md.digest();
		return convertToHex(sha1hash);
	}
}
