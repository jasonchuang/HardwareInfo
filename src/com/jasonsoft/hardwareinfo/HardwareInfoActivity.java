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

//import com.android.example.spinner.R;

import android.app.Activity;
import android.os.Build;
import android.os.Bundle;
import android.util.DisplayMetrics;
import android.widget.TextView;

/**
 * Displays an Android spinner widget backed by data in an array. The
 * array is loaded from the strings.xml resources file.
 */
public class HardwareInfoActivity extends Activity {
    TextView mResultText;
    DisplayMetrics mDisplayMetrics;

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
        StringBuffer sb = new StringBuffer();
        sb.append(getString(R.string.brand) + ": " + Build.BRAND);
        sb.append("\n");
        sb.append(getString(R.string.screen_size) + ": " + Utils.getScreenSize(mDisplayMetrics)
                + " " + getString(R.string.inches));
        sb.append("\n");
        sb.append(getString(R.string.screen_resolution) + ": " + Utils.getScreenResolution(mDisplayMetrics));
        sb.append("\n");
        sb.append(getString(R.string.camera_pixels) + ": " + Utils.getCameraPixels());
        sb.append("\n");

        mResultText.setText(sb.toString());
    }

}
