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
 *
 */
#include <jni.h>
#include <stdio.h>
#include <stdlib.h>
#include <cpu-features.h>
#include <android/log.h>

#define LOGV(...) __android_log_print(ANDROID_LOG_VERBOSE, "jason", __VA_ARGS__)
#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG,   "jason", __VA_ARGS__)
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO,    "jason", __VA_ARGS__)
#define LOGW(...) __android_log_print(ANDROID_LOG_WARN,    "jason", __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR,   "jason", __VA_ARGS__)

const int cpu_features_list[] = {
    ANDROID_CPU_ARM_FEATURE_ARMv7,
    ANDROID_CPU_ARM_FEATURE_VFPv3,
    ANDROID_CPU_ARM_FEATURE_NEON,
    ANDROID_CPU_ARM_FEATURE_LDREX_STREX,
    ANDROID_CPU_ARM_FEATURE_VFPv2,
    ANDROID_CPU_ARM_FEATURE_VFP_D32,
    ANDROID_CPU_ARM_FEATURE_VFP_FP16,
    ANDROID_CPU_ARM_FEATURE_VFP_FMA,
    ANDROID_CPU_ARM_FEATURE_NEON_FMA,
    ANDROID_CPU_ARM_FEATURE_IDIV_ARM,
    ANDROID_CPU_ARM_FEATURE_IDIV_THUMB2,
    ANDROID_CPU_ARM_FEATURE_iWMMXt,
    ANDROID_CPU_X86_FEATURE_SSSE3,
    ANDROID_CPU_X86_FEATURE_POPCNT,
    ANDROID_CPU_X86_FEATURE_MOVBE
};

const char cpu_features_string_list[][20] = {
    "armv7",
    "vfpv3",
    "neon",
    "ldrex_strex",
    "vfpv2",
    "vfp_d32",
    "vfp_fp16",
    "vfp_fma",
    "neon_fma",
    "idiv_arm",
    "idiv_thumb2",
    "iwmmxt",
    "ssse3",
    "popcnt",
    "movbe"
};

void appendString(char *strDestination, char *strSource) {
    strcat(strDestination, " ");
    strcat(strDestination, strSource);
}

char* get_cpu_family() {
    if (android_getCpuFamily() == ANDROID_CPU_FAMILY_ARM) {
        return "ARM";
    } else if (android_getCpuFamily() == ANDROID_CPU_FAMILY_X86) {
        return "X86";
    } else if (android_getCpuFamily() == ANDROID_CPU_FAMILY_MIPS) {
        return "MIPS";
    } else {
        return "Unknown";
    }
}

char* get_cpu_features() {
    char cpu_features[256] = "";
    uint64_t features = android_getCpuFeatures();

    int i = 0;
    int features_length = sizeof(cpu_features_list) / sizeof(int);
    for (i = 0; i < features_length; i++) {
        if (features & cpu_features_list[i]) {
            appendString(cpu_features, cpu_features_string_list[i]);
        }
    }

    return cpu_features;
}

jstring
Java_com_jasonsoft_hardwareinfo_HardwareInfoActivity_getCpuFamilyFromJNI( JNIEnv* env,
                                               jobject thiz )
{
    return (*env)->NewStringUTF(env, get_cpu_family());
}

jstring
Java_com_jasonsoft_hardwareinfo_HardwareInfoActivity_getCpuCountFromJNI( JNIEnv* env,
                                               jobject thiz )
{
    return android_getCpuCount();
}

jstring
Java_com_jasonsoft_hardwareinfo_HardwareInfoActivity_getCpuFeaturesFromJNI( JNIEnv* env,
                                               jobject thiz )
{
    char buffer[256];
    strlcpy(buffer, get_cpu_features(), sizeof buffer);
    return (*env)->NewStringUTF(env, buffer);
}
