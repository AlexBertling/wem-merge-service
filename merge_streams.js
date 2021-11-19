const fs = require("fs");
const { pipeline } = require('stream/promises');
const { performance } = require('perf_hooks');

const FILE = "/public/merge.txt";

async function readFileStreamIntoArray(filename) {
    let lines = [];
    await pipeline(
        fs.createReadStream(filename, "utf8"),
        async function (source) {
            source.setEncoding('utf8');
            for await (const chunk of source) {
                const chunkArr = chunk.split("\n");
                lines[lines.length-1] += chunkArr[0];
                lines.push(...chunkArr.slice(1));
            }
        }
    );
    return lines;
}

exports.mergeFiles =  async function mergeFiles(filename1, filename2) {
    const startTime = performance.now();

    const lines1 = await readFileStreamIntoArray(filename1),
        lines2 = await readFileStreamIntoArray(filename2);
    
    console.log(lines1.length + ", " + lines2.length);

    fs.writeFileSync(__dirname + FILE, "");
    const writeStream = fs.createWriteStream(__dirname + FILE);
    let count = 0;
    for ( const line of lines1 ){
        await writeStream.write(line + lines2[count++] + "\n");
    }
    writeStream.end();

    const endTime = performance.now();
    console.log(`Merge took ${(endTime - startTime).toFixed(2)} milliseconds`);

    return FILE;
}