import fs from 'fs-extra';
import path from 'path';

async function copyBuild() {
    const root = process.cwd();
    const source = path.resolve(root, 'client/dist');
    const destination = path.resolve(root, 'api/dist/public');

    console.log('🚀 Starting build sync...');
    console.log(`Source: ${source}`);
    console.log(`Destination: ${destination}`);

    try {
        if (await fs.pathExists(destination)) {
            await fs.remove(destination);
            console.log('✓ Old build removed from api/dist/public');
        }
        if (!(await fs.pathExists(source))) {
            throw new Error(
                `Source directory not found: ${source}. Did you run "yarn build:client:dev" or "yarn build:client:prod"?`
            );
        }
        await fs.ensureDir(path.resolve(root, 'api/dist'));
        await fs.copy(source, destination);
        console.log('✓ UI build successfully copied to api/dist/public');
    } catch (err) {
        const error = err;
        console.error('✗ Error copying build:', error.message);
        process.exit(1);
    }
}

copyBuild();
