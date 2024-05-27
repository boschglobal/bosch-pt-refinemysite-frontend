/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';

enum ByteUnits {
    kB,
    MB,
    GB,
    TB,
    PB,
    EB,
    ZB,
    YB
}

export const CONVERSION_RATIO_MB_TO_BYTES = 1024 * 1024;

@Injectable({
    providedIn: 'root',
})
export class AttachmentHelper {

    public invalidCharsOnFilenameRegex = /[^\w\s.-]+/gi;

    /**
     * @description Retrieves file size with units
     * @param {number} fileSizeInBytes
     * @returns {string}
     */
    public getHumanFriendlyFileSize(fileSizeInBytes: number): string {
        let byteUnitIndex = -1;

        do {
            fileSizeInBytes = fileSizeInBytes / 1024;
            byteUnitIndex++;
        } while (fileSizeInBytes > 1024);

        const size = Math.max(fileSizeInBytes, 0.1).toFixed(1);
        const unit = ByteUnits[byteUnitIndex];

        return `${size} ${unit}`;
    }

    /**
     * @description Convert MegaBytes to Bytes
     * @param {number} fileSizeInMb
     * @returns {number}
     */
    public convertMbToBytes(fileSizeInMb: number): number {
        return fileSizeInMb * CONVERSION_RATIO_MB_TO_BYTES;
    }

    /**
     * @description Convert Bytes to MegaBytes
     * @param {number} fileSizeBytes
     * @returns {number}
     */
    public convertBytesToMb(fileSizeBytes: number): number {
        return fileSizeBytes / CONVERSION_RATIO_MB_TO_BYTES;
    }

    /**
     * @description Remove special characters from file's name
     * @param {File} file
     * @returns {File}
     */
    public normalizeFilename(file: File): File {
        return new File([file], file.name.replace(this.invalidCharsOnFilenameRegex, ''), file);
    }
}
