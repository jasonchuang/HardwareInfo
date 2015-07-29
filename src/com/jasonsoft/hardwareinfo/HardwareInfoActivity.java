/*
 * Copyright (C) 2010 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.jasonsoft.hardwareinfo;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.AsyncTask;
import android.os.BatteryManager;
import android.os.Build;
import android.os.Bundle;
import android.util.DisplayMetrics;
import android.widget.TextView;

/**
 * Displays an Android spinner widget backed by data in an array. The
 * array is loaded from the strings.xml resources file.
 */
public class HardwareInfoActivity extends Activity implements SensorEventListener {

    TextView mResultText;
    DisplayMetrics mDisplayMetrics;

    private BroadcastReceiver mBatteryStatusReceiver;
    private int mBatteryTemperature;
    private SensorManager mSensorManager;
    private Sensor mAmbientTemperatureSensor;
    private Sensor mLightSensor;
    private Sensor mRelativeHumiditySensor;
    private int mAmbientTemperature;
    private int mLight;
    private int mRelativeHumidity;

    static {
        System.loadLibrary("cpuinfo");
    }

    public native String getCpuFamilyFromJNI();
    public native int getCpuCountFromJNI();
    public native String getCpuFeaturesFromJNI();

    @Override
    public void onCreate(Bundle savedInstanceState) {
        /**
         * derived classes that use onCreate() overrides must always call the super constructor
         */
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);
        mResultText = (TextView)findViewById(R.id.result);

        mDisplayMetrics = new DisplayMetrics();
        getWindowManager().getDefaultDisplay().getMetrics(mDisplayMetrics);

        mBatteryStatusReceiver = new BatteryStatusReceiver();
        mSensorManager = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        mAmbientTemperatureSensor = mSensorManager.getDefaultSensor(Sensor.TYPE_AMBIENT_TEMPERATURE);
        mRelativeHumiditySensor = mSensorManager.getDefaultSensor(Sensor.TYPE_RELATIVE_HUMIDITY);
        mLightSensor = mSensorManager.getDefaultSensor(Sensor.TYPE_LIGHT);
    }

    /**
     * Since onResume() is always called when an Activity is starting, even if it is re-displaying
     * after being hidden, it is the best place to restore state.
     *
     * @see android.app.Activity#onResume()
     */
    @Override
    public void onResume() {
        super.onResume();
        registerReceiver(mBatteryStatusReceiver, new IntentFilter(Intent.ACTION_BATTERY_CHANGED));
        if (mAmbientTemperatureSensor != null) {
            mSensorManager.registerListener(this, mAmbientTemperatureSensor, SensorManager.SENSOR_DELAY_NORMAL);
        }
        if (mRelativeHumiditySensor != null) {
            mSensorManager.registerListener(this, mRelativeHumiditySensor, SensorManager.SENSOR_DELAY_NORMAL);
        }
        if (mLightSensor != null) {
            mSensorManager.registerListener(this, mLightSensor, SensorManager.SENSOR_DELAY_NORMAL);
        }

        new UpdateHardwareInfoAsyncTask(mResultText).execute();
    }

    @Override
    protected void onPause() {
        super.onPause();
        unregisterReceiver(mBatteryStatusReceiver);
        if (mAmbientTemperatureSensor != null) {
            mSensorManager.unregisterListener(this);
        }
        if (mRelativeHumiditySensor != null) {
            mSensorManager.unregisterListener(this);
        }
        if (mLightSensor != null) {
            mSensorManager.unregisterListener(this);
        }
    }

    private final class BatteryStatusReceiver extends BroadcastReceiver {

        @Override
        public void onReceive(Context context, Intent intent) {
            if (Intent.ACTION_BATTERY_CHANGED.equals(intent.getAction())) {
                // temperature - int, current battery temperature in tenths of a degree Centigrade
                mBatteryTemperature = intent.getIntExtra(BatteryManager.EXTRA_TEMPERATURE, 0) / 10;
                new UpdateHardwareInfoAsyncTask(mResultText).execute();
            }
        }
    }

    @Override
    public final void onAccuracyChanged(Sensor sensor, int accuracy) {
        // Do something here if sensor accuracy changes.
    }

    @Override
    public final void onSensorChanged(SensorEvent event) {
        // °C, Ambient air temperature.

        switch (event.sensor.getType()) {
        case Sensor.TYPE_AMBIENT_TEMPERATURE:
            mAmbientTemperature = (int) event.values[0];
            break;
        case Sensor.TYPE_RELATIVE_HUMIDITY:
            mRelativeHumidity = (int) event.values[0];
            break;
        case Sensor.TYPE_LIGHT:
            mLight = (int) event.values[0];
            break;

        default:
            break;
        }
    }

    private String getHardwareInfoResultText() {
        StringBuffer sb = new StringBuffer();
        sb.append(getString(R.string.brand) + ": " + Build.BRAND);
        sb.append("\n");
        sb.append(getString(R.string.cpu_family) + ": " + getCpuFamilyFromJNI());
        sb.append("\n");
        int cpuCount = getCpuCountFromJNI();
        String cpuCores = getResources().getQuantityString(R.plurals.cpu_cores, cpuCount, cpuCount);
        sb.append(getString(R.string.cpu_count) + ": " + cpuCores);
        sb.append("\n");
        sb.append(getString(R.string.screen_size) + ": " + Utils.getScreenSize(mDisplayMetrics)
                + " " + getString(R.string.inches));
        sb.append("\n");
        sb.append(getString(R.string.screen_resolution) + ": " + Utils.getScreenResolution(mDisplayMetrics));
        sb.append("\n");
        sb.append(getString(R.string.screen_density) + ": " + Utils.getScreenDensity(mDisplayMetrics,
                    getString(R.string.units_of_screen_density)));
        sb.append("\n");
        sb.append(getString(R.string.camera_pixels) + ": " + Utils.getCameraPixels());
        sb.append("\n");
        sb.append(getString(R.string.battery_temperature) + ": " + mBatteryTemperature +
                getString(R.string.units_of_temperature));
        sb.append("\n");
        sb.append(getString(R.string.ambient_temperature) + ": " + ((mAmbientTemperatureSensor != null)
                ? mAmbientTemperature + getString(R.string.units_of_temperature)
                : getString(R.string.not_available)));
        sb.append("\n");
        sb.append(getString(R.string.relative_humidity) + ": " + ((mRelativeHumiditySensor != null)
                ? mRelativeHumidity + getString(R.string.units_of_relative_humidity)
                : getString(R.string.not_available)));
        sb.append("\n");
        sb.append(getString(R.string.light) + ": " + ((mLightSensor != null)
                ? mLight + getString(R.string.units_of_light)
                : getString(R.string.not_available)));
        sb.append("\n");
        sb.append(getString(R.string.cpu_features) + ": " + getCpuFeaturesFromJNI());
        sb.append("\n");

        return sb.toString();
    }

    class UpdateHardwareInfoAsyncTask extends AsyncTask<Void, Void, String> {
        private TextView mResultText;

        public UpdateHardwareInfoAsyncTask(TextView resultText) {
            this.mResultText = resultText;
        }

        protected void onPreExecute() {
        }

        @Override
        protected String doInBackground(Void... params) {
            return getHardwareInfoResultText();
        }

        @Override
        protected void onProgressUpdate(Void... params) {
        }

        @Override
        protected void onPostExecute(String result) {
            mResultText.setText(result);
        }
    }

}
