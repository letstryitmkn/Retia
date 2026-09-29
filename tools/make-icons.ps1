# Turns assets/icon-source.webp into the square PNG icons phones need.
# - Fills the black corners around the rounded artwork with the icon's sage green
# - Crops to a full-bleed square (phones round the corners themselves)
# - Exports 512, 192, 180 (iPhone), 32 (browser tab) and a 512 "maskable" version for Android
# Usage: powershell -ExecutionPolicy Bypass -File tools\make-icons.ps1
Add-Type -AssemblyName PresentationCore, WindowsBase
Add-Type -TypeDefinition @"
using System;
using System.Collections.Generic;
public static class IconFill {
    // Flood-fills dark pixels connected to the image border with the given colour (BGRA bytes).
    public static void FillOutside(byte[] px, int w, int h, int threshold, byte b, byte g, byte r) {
        var seen = new bool[w * h];
        var q = new Queue<int>();
        for (int x = 0; x < w; x++) { q.Enqueue(x); q.Enqueue((h - 1) * w + x); }
        for (int y = 0; y < h; y++) { q.Enqueue(y * w); q.Enqueue(y * w + w - 1); }
        while (q.Count > 0) {
            int p = q.Dequeue();
            if (seen[p]) continue;
            seen[p] = true;
            int i = p * 4;
            int lum = (px[i] + px[i + 1] + px[i + 2]) / 3;
            if (lum >= threshold) continue;
            px[i] = b; px[i + 1] = g; px[i + 2] = r; px[i + 3] = 255;
            int x = p % w, y = p / w;
            if (x > 0) q.Enqueue(p - 1);
            if (x < w - 1) q.Enqueue(p + 1);
            if (y > 0) q.Enqueue(p - w);
            if (y < h - 1) q.Enqueue(p + w);
        }
    }
}
"@

$root = Split-Path -Parent $PSScriptRoot
$src = Join-Path $root 'assets\icon-source.webp'
$out = Join-Path $root 'assets'

$fs = [IO.File]::OpenRead($src)
$frame = [System.Windows.Media.Imaging.BitmapDecoder]::Create($fs, 'PreservePixelFormat', 'OnLoad').Frames[0]
$fs.Close()
$bmp = [System.Windows.Media.Imaging.FormatConvertedBitmap]::new($frame, [System.Windows.Media.PixelFormats]::Bgra32, $null, 0)
$w = $bmp.PixelWidth; $h = $bmp.PixelHeight; $stride = $w * 4
$px = New-Object byte[] ($stride * $h)
$bmp.CopyPixels($px, $stride, 0)

function Lum([int]$x, [int]$y) { $i = $y * $stride + $x * 4; [int](($px[$i] + $px[$i + 1] + $px[$i + 2]) / 3) }

# Where the sage shape starts (from the left and right edges, on the middle row)
$mid = [int]($h / 2)
$left = 0; while ((Lum $left $mid) -lt 100) { $left++ }
$right = $w - 1; while ((Lum $right $mid) -lt 100) { $right-- }
$top = 0; while ((Lum $mid $top) -lt 100) { $top++ }
$bottom = $h - 1; while ((Lum $mid $bottom) -lt 100) { $bottom-- }

# Sage colour: sample just inside the edge of the shape
$si = $mid * $stride + ($left + 12) * 4
$sb = $px[$si]; $sg = $px[$si + 1]; $sr = $px[$si + 2]
Write-Host "Shape: x $left-$right, y $top-$bottom. Sage: #$('{0:X2}{1:X2}{2:X2}' -f $sr, $sg, $sb)"

[IconFill]::FillOutside($px, $w, $h, 110, $sb, $sg, $sr)

# Square crop around the shape (a couple of pixels in, to drop the soft edge)
$size = [Math]::Min($right - $left, $bottom - $top) - 4
$cx = [int](($left + $right) / 2); $cy = [int](($top + $bottom) / 2)
$filled = [System.Windows.Media.Imaging.BitmapSource]::Create($w, $h, 96, 96, [System.Windows.Media.PixelFormats]::Bgra32, $null, $px, $stride)
$rect = [System.Windows.Int32Rect]::new($cx - [int]($size / 2), $cy - [int]($size / 2), $size, $size)
$square = [System.Windows.Media.Imaging.CroppedBitmap]::new($filled, $rect)
$sageBrush = [System.Windows.Media.SolidColorBrush]::new([System.Windows.Media.Color]::FromRgb($sr, $sg, $sb))

function Save-Icon([int]$dim, [string]$name, [double]$artScale = 1.0) {
  $visual = [System.Windows.Media.DrawingVisual]::new()
  [System.Windows.Media.RenderOptions]::SetBitmapScalingMode($visual, 'HighQuality')
  $dc = $visual.RenderOpen()
  $dc.DrawRectangle($sageBrush, $null, [System.Windows.Rect]::new(0, 0, $dim, $dim))
  $art = $dim * $artScale
  $off = ($dim - $art) / 2
  $dc.DrawImage($square, [System.Windows.Rect]::new($off, $off, $art, $art))
  $dc.Close()
  $rtb = [System.Windows.Media.Imaging.RenderTargetBitmap]::new($dim, $dim, 96, 96, [System.Windows.Media.PixelFormats]::Pbgra32)
  $rtb.Render($visual)
  $enc = [System.Windows.Media.Imaging.PngBitmapEncoder]::new()
  $enc.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($rtb))
  $file = [IO.File]::Create((Join-Path $out $name))
  $enc.Save($file); $file.Close()
  Write-Host "Saved assets\$name"
}

Save-Icon 512 'icon-512.png'
Save-Icon 192 'icon-192.png'
Save-Icon 180 'apple-touch-icon.png'
Save-Icon 32 'icon-32.png'
Save-Icon 512 'icon-maskable-512.png' 0.8   # Android may crop to a circle: keep the art inside the safe zone
