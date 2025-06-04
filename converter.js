// const { FFmpegWASM } = require("./package/dist/umd/ffmpeg");

document.getElementById('convertBtn').addEventListener('click', async () => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const conversionType = document.getElementById('conversionType').value;
    const status = document.getElementById('status');
    const progressBar = document.getElementById('progressBar');

    if (!file) {
        status.textContent = 'Please select a file first.';
        return;
    }

    status.textContent = 'Converting...';
    progressBar.value = 0;

    try {
        let resultFile;
        switch (conversionType) {
            case 'mkvToMp4':
                console.log("Converting MKV to MP4...");
                resultFile = await convertMKVToMP4(file, progressBar);
                break;
            case 'webpToPng':
                console.log("Converting WebP to PNG...");
                resultFile = await convertWebPToPNG(file);
                break;
            case 'videoToMp3':
                console.log("Converting Video to MP3...");
                resultFile = await convertVideoToMP3(file, progressBar);
                break;
            default:
                throw new Error('Invalid conversion type');
        }

        status.textContent = 'Conversion successful! You can download the file.';
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(resultFile);
        downloadLink.download = resultFile.name;
        downloadLink.textContent = 'Download converted file';
        document.body.appendChild(downloadLink);
    } catch (error) {
        status.textContent = 'Error during conversion. Please try again.';
        console.error("Conversion Error: ", error);
    }
});



async function convertMKVToMP4(file, progressBar) {
    console.log("Starting MKV to MP4 conversion...");
    const ffmpeg = new FFmpegWASM.FFmpeg({ log: true });

    try {
        await ffmpeg.load();
        console.log("FFmpeg loaded successfully!");

        ffmpeg.FS('writeFile', file.name, await file.arrayBuffer());
        console.log(`Input file ${file.name} written to FFmpeg virtual file system`);

        await ffmpeg.run('-i', file.name, '-c:v', 'libx264', '-c:a', 'aac', 'output.mp4');
        console.log("Conversion completed!");

        const outputFile = ffmpeg.FS('readFile', 'output.mp4');
        const outputBlob = new Blob([outputFile.buffer], { type: 'video/mp4' });

        progressBar.value = 100;
        console.log("Conversion finished successfully. Returning the file...");

        return new File([outputBlob], 'output.mp4');
    } catch (error) {
        console.error("Error during MKV to MP4 conversion:", error);
        throw error;
    }
}



async function convertWebPToPNG(file) {
    return new Promise((resolve, reject) => {
        // Using WebP-converter.js to convert WebP to PNG
        webp.convert(file, 'png').then(result => {
            const outputBlob = result.blob;
            const downloadLink = URL.createObjectURL(outputBlob);

            resolve(new File([outputBlob], 'output.png'));
        }).catch(error => {
            console.error(error);
            reject(error);
        });
    });
}


async function convertVideoToMP3(file, progressBar) {
    const ffmpeg = new FFmpegWASM.FFmpeg({ log: true });

    await ffmpeg.load();
    ffmpeg.FS('writeFile', file.name, await file.arrayBuffer());
    await ffmpeg.run('-i', file.name, '-vn', '-ar', '44100', '-ac', '2', '-ab', '192k', '-f', 'mp3', 'output.mp3');
    const outputFile = ffmpeg.FS('readFile', 'output.mp3');
    const outputBlob = new Blob([outputFile.buffer], { type: 'audio/mp3' });

    progressBar.value = 100;
    return new File([outputBlob], 'output.mp3');
}
