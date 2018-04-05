const octokit = require('@octokit/rest')();
const fs = require('fs');
const mime = require('mime-types')

const version_to_release = process.argv[2];
const target_commit = process.argv[3];
const version_tag = `v${version_to_release}`;

const files_to_upload = [
  `dist/bpmn-studio Setup ${version_to_release}.exe`,
  `dist/bpmn-studio Setup ${version_to_release}.exe.blockmap`,
  `dist/bpmn-studio-${version_to_release}-mac.zip`,
  `dist/bpmn-studio-${version_to_release}-x86_64.AppImage`,
  `dist/bpmn-studio-${version_to_release}.dmg`,
  `dist/bpmn-studio-${version_to_release}.dmg.blockmap`,
  `dist/bpmn-studio_${version_to_release}_amd64.snap`,
  `dist/github/latest-mac.json`,
  `dist/latest-linux.yml`,
  `dist/latest-mac.yml`,
  `dist/latest.yml`,
];

async function authenticate() {
  octokit.authenticate({
    type: 'token',
    token: process.env['RELEASE_GH_TOKEN'],
  });
}

async function check_for_existing_release() {
  try {
    await octokit.repos.getReleaseByTag({
      owner: 'process-engine',
      repo: 'bpmn-studio',
      tag: version_tag,
    });
  } catch(error) {
    return false;
  }
  return true;
}

async function create_release() {
  console.log('Creating GitHub Release');
  return octokit.repos.createRelease({
    owner: 'process-engine',
    repo: 'bpmn-studio',
    tag_name: version_tag,
    target_commitish: target_commit,
    name: version_to_release,
    body: 'WIP',
    draft: true,
    prerelease: true,
  });
}

function get_filename(path) {
  const slash_at = path.lastIndexOf('/');
  if (slash_at < 0) {
    return path;
  }
  return path.substr(slash_at + 1);
}

async function upload_release_asset(upload_url, file) {
  const buffer = fs.readFileSync(file);
  const file_size = fs.statSync(file).size;
  // detect mine type
  const content_type = mime.lookup(file) || 'text/plain';
  const name = get_filename(file).replace(' ', '_');

  console.log(`Uploading Asset '${file}'. Content-Type '${content_type}'`);
  return octokit.repos.uploadAsset({
    url: upload_url,
    file: buffer,
    contentType: content_type,
    contentLength: file_size,
    name: name,
  });
}

async function main() {
  await authenticate();

  const release_already_exists = await check_for_existing_release();
  if (release_already_exists) {
    console.log(`A release with the tag ${version_tag} already exists.`);
    console.log('Skipping publish step.');
    process.exit(0);
  }

  const created_github_release = await create_release();
  const upload_url_for_assets = created_github_release.data.upload_url;

  const upload_promises = files_to_upload.map((file) => {
    return upload_release_asset(upload_url_for_assets, file);
  });

  await Promise.all(upload_promises);
}

main().catch((error) => {
  console.log(error);
})
