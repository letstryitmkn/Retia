# Prepares the loading-screen artwork: assets/splash-source.webp -> assets/splash.jpg
# - Paints out the drawn loading bar and "Loading..." (the app shows its own animation there)
# - Trims the drawn border (phones crop the sides, so the app draws its own border instead)
# Usage: powershell -ExecutionPolicy Bypass -File tools\make-splash.ps1
Add-Type -AssemblyName PresentationCore, WindowsBase
Add-Type -TypeDefinition @"
public static class SplashPatch {
    // Replaces a rectangle with a vertical blend of the rows just above and below it, plus a little grain.
    public static void Blend(byte[] px, int stride, int x0, int y0, int x1, int y1, int seed) {
        var rnd = new System.Random(seed);
        for (int x = x0; x <= x1; x++) {
            int top = (y0 - 3) * stride + x * 4, bottom = (y1 + 3) * stride + x * 4;
            for (int y = y0; y <= y1; y++) {
                double t = (double)(y - y0) / (y1 - y0);
                int noise = rnd.Next(-3, 4);
                int i = y * stride + x * 4;
                for (int c = 0; c < 3; c++) {
                    int v = (int)(px[top + c] * (1 - t) + px[bottom + c] * t) + noise;
                    px[i + c] = (byte)System.Math.Max(0, System.Math.Min(255, v));
                }
            }
        }
    }
}
"@

$root = Split-Path -Parent $PSScriptRoot
$fs = [IO.File]::OpenRead((Join-Path $root 'assets\splash-source.webp'))
$frame = [System.Windows.Media.Imaging.BitmapDecoder]::Create($fs, 'PreservePixelFormat', 'OnLoad').Frames[0]
$fs.Close()
$bmp = [System.Windows.Media.Imaging.FormatConvertedBitmap]::new($frame, [System.Windows.Media.PixelFormats]::Bgra32, $null, 0)
$w = $bmp.PixelWidth; $h = $bmp.PixelHeight; $stride = $w * 4
$px = New-Object byte[] ($stride * $h)
$bmp.CopyPixels($px, $stride, 0)

# Positions measured on the 1100x1430 artwork
[SplashPatch]::Blend($px, $stride, 404, 1248, 696, 1280, 1)   # loading bar
[SplashPatch]::Blend($px, $stride, 474, 1288, 630, 1324, 2)   # "Loading..."

$patched = [System.Windows.Media.Imaging.BitmapSource]::Create($w, $h, 96, 96, [System.Windows.Media.PixelFormats]::Bgra32, $null, $px, $stride)
$inner = [System.Windows.Media.Imaging.CroppedBitmap]::new($patched, [System.Windows.Int32Rect]::new(34, 32, $w - 68, $h - 64))

$enc = [System.Windows.Media.Imaging.JpegBitmapEncoder]::new()
$enc.QualityLevel = 88
$enc.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($inner))
$out = [IO.File]::Create((Join-Path $root 'assets\splash.jpg'))
$enc.Save($out); $out.Close()
Write-Host "Saved assets\splash.jpg ($($w - 68)x$($h - 64))"
