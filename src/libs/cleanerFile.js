import fs from 'fs';
import path from 'path';

function cleanerFile(dir = 'uploads/') {
    if (!fs.existsSync(dir)) {
        console.log("Directory not found!")
        fs.mkdirSync(dir);
    }
    fs.readdir(dir, (err, files) => {
        if (err) {
            console.error(err);
            return;
        }

        for (const file of files) {
            fs.unlink(path.join(dir, file), err => {
                err && console.error(err);
            })
        }
    });
    console.log("cleaner file successfully")
}

export default cleanerFile;
