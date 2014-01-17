/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
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

import java.lang.Math;
import java.text.NumberFormat;
import java.util.List;

import android.hardware.Camera;
import android.hardware.Camera.CameraInfo;
import android.hardware.Camera.Size;
import android.util.DisplayMetrics;

public class Utils {

    /**
     * Instances should NOT be constructed in standard programming.
     */
    public Utils() {
        super();
    }

    /**
     * The number of bytes in a kilobyte.
     */
    public static final long ONE_KB = 1024;

    /**
     * The number of bytes in a megabyte.
     */
    public static final long ONE_MB = ONE_KB * ONE_KB;

    /**
     * The number of bytes in a gigabyte.
     */
    public static final long ONE_GB = ONE_KB * ONE_MB;


    public static String getScreenSize(DisplayMetrics dm) {
        int height = dm.heightPixels;
        int width = dm.widthPixels;
        float physicalDpiX = dm.xdpi;
        float physicalDpiY = dm.ydpi;

        float widhtInInches = width / physicalDpiX;
        float heightInInches = height / physicalDpiY;
        double diagonalInches = Math.sqrt((heightInInches * heightInInches) + (widhtInInches * widhtInInches));

        NumberFormat nf = NumberFormat.getInstance();
        nf.setMaximumFractionDigits(1);
        return nf.format(diagonalInches);
    }

    public static String getScreenResolution(DisplayMetrics dm) {
        int height = dm.heightPixels;
        int width = dm.widthPixels;
        return height + " * " + width;
    }

    public static String getCameraPixels() {
        // Open Camera
        Camera camera = Camera.open();
        Camera.Parameters parameters = camera.getParameters();
        List<Camera.Size> sizeList = parameters.getSupportedPictureSizes();

        long maxPixels = 0;
        for (Camera.Size size : sizeList) {
            maxPixels = Math.max(size.height * size.width, maxPixels);
        }

        // Have to close Camera
        if (camera != null) {
            camera.stopPreview();
            camera.release();
            camera = null;
        }

        return byteCountToDisplaySize(maxPixels);
    }

    //-----------------------------------------------------------------------
    /**
     * Returns a human-readable version of the file size, where the input
     * represents a specific number of bytes.
     *
     * @param size  the number of bytes
     * @return a human-readable display value (includes units)
     */
    public static String byteCountToDisplaySize(long size) {
        String displaySize;

        if (size / ONE_GB > 0) {
            displaySize = String.valueOf(size / ONE_GB) + " GB";
        } else if (size / ONE_MB > 0) {
            displaySize = String.valueOf(size / ONE_MB) + " MB";
        } else if (size / ONE_KB > 0) {
            displaySize = String.valueOf(size / ONE_KB) + " KB";
        } else {
            displaySize = String.valueOf(size) + " bytes";
        }
        return displaySize;
    }

}
