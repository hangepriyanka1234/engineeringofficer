import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export interface AppIconStatus {
  hasCustomIcon: boolean;
  fileSize: number;
  lastModified: string | null;
  dimensions: { width: number; height: number };
  url: string;
  androidMipmapsUpdated: boolean;
  updatedFilesCount: number;
}

export interface ReplaceIconResult {
  success: boolean;
  message: string;
  fileSize: number;
  dimensions: { width: number; height: number };
  updatedFiles: string[];
  timestamp: string;
}

export class ServerAppIconEngine {
  private static rootDir = process.cwd();
  private static publicDir = path.join(process.cwd(), 'public');
  private static distDir = path.join(process.cwd(), 'dist');
  private static androidResDir = path.join(process.cwd(), 'android', 'app', 'src', 'main', 'res');

  private static densities: { folder: string; size: number }[] = [
    { folder: 'mipmap-mdpi', size: 48 },
    { folder: 'mipmap-hdpi', size: 72 },
    { folder: 'mipmap-xhdpi', size: 96 },
    { folder: 'mipmap-xxhdpi', size: 144 },
    { folder: 'mipmap-xxxhdpi', size: 192 },
  ];

  /**
   * Replace ic_launcher.png and regenerate all Android mipmaps + Web assets
   */
  public static async replaceIcon(
    base64Data: string,
    originalFileName: string = 'ic_launcher.png'
  ): Promise<ReplaceIconResult> {
    try {
      // 1. Sanitize base64 payload
      let cleanBase64 = base64Data;
      if (base64Data.includes(';base64,')) {
        cleanBase64 = base64Data.split(';base64,')[1];
      }
      const buffer = Buffer.from(cleanBase64, 'base64');

      if (buffer.length < 50) {
        throw new Error('Invalid image file: File is empty or corrupted.');
      }

      // 2. Ensure directories exist
      if (!fs.existsSync(this.publicDir)) {
        fs.mkdirSync(this.publicDir, { recursive: true });
      }

      const updatedFiles: string[] = [];

      // 3. Write Master ic_launcher.png to public/
      const masterPath = path.join(this.publicDir, 'ic_launcher.png');
      fs.writeFileSync(masterPath, buffer);
      updatedFiles.push('public/ic_launcher.png');

      // Also copy to icon.png
      const iconPath = path.join(this.publicDir, 'icon.png');
      fs.writeFileSync(iconPath, buffer);
      updatedFiles.push('public/icon.png');

      // If dist directory exists, write there as well
      if (fs.existsSync(this.distDir)) {
        fs.writeFileSync(path.join(this.distDir, 'ic_launcher.png'), buffer);
        fs.writeFileSync(path.join(this.distDir, 'icon.png'), buffer);
        updatedFiles.push('dist/ic_launcher.png');
        updatedFiles.push('dist/icon.png');
      }

      // 4. Measure dimensions with identify if available, otherwise default to 512
      let width = 512;
      let height = 512;
      try {
        const { stdout } = await execPromise(`identify -format "%w %h" "${masterPath}"`);
        const parts = stdout.trim().split(' ');
        if (parts.length >= 2) {
          width = parseInt(parts[0], 10) || 512;
          height = parseInt(parts[1], 10) || 512;
        }
      } catch (err) {
        console.warn('[AppIconEngine] Could not detect dimensions via identify, fallback to 512x512', err);
      }

      // 5. Generate PWA standard sizes (192x192 & 512x512)
      try {
        const pwa192 = path.join(this.publicDir, 'icon-192.png');
        const pwa512 = path.join(this.publicDir, 'icon-512.png');
        await execPromise(`convert "${masterPath}" -resize 192x192 "${pwa192}"`);
        await execPromise(`convert "${masterPath}" -resize 512x512 "${pwa512}"`);
        updatedFiles.push('public/icon-192.png');
        updatedFiles.push('public/icon-512.png');

        if (fs.existsSync(this.distDir)) {
          fs.copyFileSync(pwa192, path.join(this.distDir, 'icon-192.png'));
          fs.copyFileSync(pwa512, path.join(this.distDir, 'icon-512.png'));
          updatedFiles.push('dist/icon-192.png');
          updatedFiles.push('dist/icon-512.png');
        }
      } catch (err) {
        console.warn('[AppIconEngine] PWA resize notice:', err);
      }

      // 6. Generate Android density mipmaps (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
      if (fs.existsSync(this.androidResDir)) {
        for (const { folder, size } of this.densities) {
          const targetDir = path.join(this.androidResDir, folder);
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }

          const squareIcon = path.join(targetDir, 'ic_launcher.png');
          const roundIcon = path.join(targetDir, 'ic_launcher_round.png');
          const half = Math.floor(size / 2);

          try {
            // Square / Adaptive density icon
            await execPromise(`convert "${masterPath}" -resize ${size}x${size} "${squareIcon}"`);
            updatedFiles.push(`android/app/src/main/res/${folder}/ic_launcher.png`);

            // Round density icon (Circle alpha mask)
            await execPromise(
              `convert "${squareIcon}" \\( +clone -threshold -1 -negate -fill white -draw "circle ${half},${half} ${half},0" \\) -alpha off -compose CopyOpacity -composite "${roundIcon}"`
            );
            updatedFiles.push(`android/app/src/main/res/${folder}/ic_launcher_round.png`);
          } catch (densityErr) {
            console.warn(`[AppIconEngine] ImageMagick error for ${folder}, fallback to direct buffer copy`, densityErr);
            fs.writeFileSync(squareIcon, buffer);
            fs.writeFileSync(roundIcon, buffer);
            updatedFiles.push(`android/app/src/main/res/${folder}/ic_launcher.png`);
            updatedFiles.push(`android/app/src/main/res/${folder}/ic_launcher_round.png`);
          }
        }
      }

      const stats = fs.statSync(masterPath);

      return {
        success: true,
        message: `ic_launcher.png यशस्वीरित्या लोड आणि रिप्लेस करण्यात आला! एकूण ${updatedFiles.length} ॲन्ड्रॉइड व वेब फाइल्स अपडेट झाल्या आहेत.`,
        fileSize: stats.size,
        dimensions: { width, height },
        updatedFiles,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('[AppIconEngine] replaceIcon error:', error);
      throw error;
    }
  }

  /**
   * Get current status of ic_launcher.png
   */
  public static getIconStatus(): AppIconStatus {
    const masterPath = path.join(this.publicDir, 'ic_launcher.png');
    const hasCustomIcon = fs.existsSync(masterPath);

    let fileSize = 0;
    let lastModified: string | null = null;
    let updatedFilesCount = 0;

    if (hasCustomIcon) {
      try {
        const stats = fs.statSync(masterPath);
        fileSize = stats.size;
        lastModified = stats.mtime.toISOString();
      } catch (e) {
        // ignore
      }
    }

    // Check Android mipmaps
    let androidMipmapsUpdated = false;
    if (fs.existsSync(this.androidResDir)) {
      const mdpi = path.join(this.androidResDir, 'mipmap-mdpi', 'ic_launcher.png');
      const xxxhdpi = path.join(this.androidResDir, 'mipmap-xxxhdpi', 'ic_launcher.png');
      if (fs.existsSync(mdpi) && fs.existsSync(xxxhdpi)) {
        androidMipmapsUpdated = true;
      }
      this.densities.forEach((d) => {
        if (fs.existsSync(path.join(this.androidResDir, d.folder, 'ic_launcher.png'))) {
          updatedFilesCount += 2;
        }
      });
    }

    return {
      hasCustomIcon,
      fileSize,
      lastModified,
      dimensions: { width: 512, height: 512 },
      url: hasCustomIcon ? '/ic_launcher.png' : '/icon.svg',
      androidMipmapsUpdated,
      updatedFilesCount,
    };
  }

  /**
   * Reset to official default engineering badge
   */
  public static async resetToDefault(): Promise<ReplaceIconResult> {
    const masterPath = path.join(this.publicDir, 'ic_launcher.png');
    // Generate fresh high-res default
    await execPromise(`convert -size 512x512 xc:'#0F2744' \\
      -fill '#1E3A8A' -draw "roundrectangle 16,16 496,496 64,64" \\
      -stroke '#38BDF8' -strokewidth 4 -fill none -draw "roundrectangle 24,24 488,488 56,56" \\
      -stroke none -fill '#F59E0B' -draw "ellipse 256,230 110,75 180,360" \\
      -fill '#D97706' -draw "rectangle 146,230 366,255" \\
      -fill '#FEF08A' -draw "rectangle 244,160 268,230" \\
      "${masterPath}"`);

    const buffer = fs.readFileSync(masterPath);
    return this.replaceIcon(buffer.toString('base64'), 'ic_launcher.png');
  }
}
